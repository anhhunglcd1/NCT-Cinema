package com.example.cinemabackend.booking;

import com.example.cinemabackend.catalog.CatalogService;
import com.example.cinemabackend.domain.*;
import com.example.cinemabackend.repository.*;
import com.example.cinemabackend.web.*;
import com.example.cinemabackend.web.Views.*;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

@Service @Transactional(isolation=Isolation.READ_COMMITTED)
public class BookingService {
    private final UserRepository users; private final RoomRepository rooms; private final SeatRepository seats;
    private final ShowtimeRepository shows; private final TicketRepository tickets; private final ReservationRepository reservations; private final PaymentRepository payments;
    private final String provider;
    public BookingService(UserRepository users, RoomRepository rooms, SeatRepository seats, ShowtimeRepository shows, TicketRepository tickets, ReservationRepository reservations, PaymentRepository payments,
        @Value("${app.payment.provider:vnpay}") String provider) {
        this.users=users; this.rooms=rooms; this.seats=seats; this.shows=shows; this.tickets=tickets; this.reservations=reservations; this.payments=payments; this.provider=provider;
    }
    public UserAccount user(Authentication auth) {
        if (auth==null) throw new ApiException(HttpStatus.UNAUTHORIZED,"Vui lòng đăng nhập.");
        return users.findByEmail(auth.getName()).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED,"Phiên đăng nhập không hợp lệ."));
    }
    private Room lockRoom(String id) { return rooms.lockById(id).orElseThrow(() -> ApiException.notFound("phòng chiếu")); }
    private void expireRoom(String roomId) {
        for (Ticket t:tickets.findByShowtimeRoomIdAndStatusAndExpiresAtLessThanEqual(roomId,"pending",Instant.now())) {
            t.status="expired"; reservations.release(t.id); Payment p=payment(t); p.status="expired";
        }
    }
    public Payment payment(Ticket t) { return payments.findByTicketId(t.id).orElseThrow(() -> ApiException.notFound("thanh toán")); }
    public TicketView view(Ticket t) { return new TicketView(t,payment(t)); }

    public Availability availability(String showId) {
        String roomId=shows.roomIdFor(showId).orElseThrow(() -> ApiException.notFound("suất chiếu"));
        lockRoom(roomId); expireRoom(roomId);
        Set<String> occupied=new HashSet<>(reservations.findByShowtimeId(showId).stream().map(r->r.seat.label).toList());
        return new Availability(showId,seats.findByRoomIdOrderByLabel(roomId).stream().map(s -> new SeatView(s.label,!s.enabled ? "blocked" : occupied.contains(s.label) ? "occupied" : "available")).toList());
    }
    public TicketView reserve(Authentication auth,Requests.BookingInput input) {
        UserAccount owner=user(auth);
        if (new HashSet<>(input.seats()).size()!=input.seats().size()) throw ApiException.badRequest("Danh sách ghế bị trùng.");
        var prior=tickets.findByOwnerIdAndIdempotencyKey(owner.id,input.idempotencyKey());
        if (prior.isPresent()) return idempotent(lockTicket(prior.get().id),input);
        String roomId=shows.roomIdFor(input.showtimeId()).orElseThrow(() -> ApiException.notFound("suất chiếu"));
        lockRoom(roomId); expireRoom(roomId);
        prior=tickets.findByOwnerIdAndIdempotencyKey(owner.id,input.idempotencyKey());
        if (prior.isPresent()) return idempotent(prior.get(),input);
        Showtime show=shows.findById(input.showtimeId()).orElseThrow(() -> ApiException.notFound("suất chiếu"));
        Instant now=Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS),start=CatalogService.start(show);
        if (!start.isAfter(now)) throw ApiException.conflict("Suất chiếu đã bắt đầu.");
        Set<String> occupied=new HashSet<>(reservations.findByShowtimeId(show.id).stream().map(r->r.seat.label).toList());
        var chosen=new ArrayList<Seat>();
        for (String label:input.seats()) {
            Seat seat=seats.findByRoomIdAndLabel(roomId,label).orElseThrow(() -> ApiException.badRequest("Ghế "+label+" không thuộc phòng chiếu."));
            if (!seat.enabled || occupied.contains(label)) throw ApiException.conflict("Ghế "+label+" không còn trống. Vui lòng chọn lại.");
            chosen.add(seat);
        }
        Ticket t=new Ticket(); t.id="NCT"+UUID.randomUUID().toString().replace("-",""); t.owner=owner; t.showtime=show;
        t.seats=new ArrayList<>(input.seats()); t.total=Math.multiplyExact(show.price,chosen.size()); t.bookedAt=now;
        t.expiresAt=start.isBefore(now.plusSeconds(300)) ? start : now.plusSeconds(300); t.idempotencyKey=input.idempotencyKey();
        tickets.saveAndFlush(t);
        for (Seat seat:chosen) { var r=new SeatReservation(); r.showtime=show; r.seat=seat; r.ticket=t; reservations.save(r); }
        Payment p=new Payment(); p.ticket=t; p.provider=provider; payments.save(p);
        return new TicketView(t,p);
    }
    private TicketView idempotent(Ticket t,Requests.BookingInput input) {
        if (!t.showtime.id.equals(input.showtimeId()) || !new HashSet<>(t.seats).equals(new HashSet<>(input.seats()))) throw ApiException.conflict("Mã yêu cầu đã được sử dụng cho lựa chọn khác.");
        return view(t);
    }
    public Ticket lockTicket(String id) {
        String roomId=tickets.roomIdFor(id).orElse(null);
        if (roomId==null) throw ApiException.notFound("vé");
        lockRoom(roomId); expireRoom(roomId);
        return tickets.findById(id).orElseThrow(() -> ApiException.notFound("vé"));
    }
    public Ticket requireOwner(Authentication auth,String id) {
        Ticket t=lockTicket(id); UserAccount owner=user(auth);
        if (!t.owner.id.equals(owner.id) && !"ADMIN".equals(owner.role)) throw ApiException.notFound("vé");
        return t;
    }
    public List<TicketView> list(Authentication auth,boolean admin) {
        UserAccount owner=user(auth);
        var found=admin ? tickets.findAllByOrderByBookedAtDesc() : tickets.findByOwnerIdOrderByBookedAtDesc(owner.id);
        found.stream().filter(t -> "pending".equals(t.status)).map(t->t.showtime.room.id).distinct().sorted().forEach(id -> { lockRoom(id); expireRoom(id); });
        return found.stream().map(this::view).toList();
    }
    public TicketView get(Authentication auth,String id) { return view(requireOwner(auth,id)); }
    public TicketView cancel(Authentication auth,String id) {
        Ticket t=requireOwner(auth,id); Payment p=payment(t);
        if ("cancelled".equals(t.status) || "expired".equals(t.status)) return view(t);
        if (!CatalogService.start(t.showtime).isAfter(Instant.now())) throw ApiException.conflict("Suất chiếu đã bắt đầu, không thể hủy vé.");
        t.status="cancelled"; reservations.release(t.id); p.status="paid".equals(p.status) ? "refunded" : "cancelled";
        return view(t);
    }
    public void expireHolds() {
        tickets.expiredRoomIds(Instant.now()).stream().sorted().forEach(id -> { lockRoom(id); expireRoom(id); });
    }
}
