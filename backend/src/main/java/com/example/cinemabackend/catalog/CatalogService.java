package com.example.cinemabackend.catalog;

import com.example.cinemabackend.domain.*;
import com.example.cinemabackend.repository.*;
import com.example.cinemabackend.web.*;
import com.example.cinemabackend.web.Views.*;
import java.time.*;
import java.text.Normalizer;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional(readOnly=true)
public class CatalogService {
    private final MovieRepository movies; private final CinemaRepository cinemas; private final RoomRepository rooms;
    private final SeatRepository seats; private final ShowtimeRepository shows; private final TicketRepository tickets;
    private final ReservationRepository reservations;
    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    public CatalogService(MovieRepository movies, CinemaRepository cinemas, RoomRepository rooms, SeatRepository seats, ShowtimeRepository shows, TicketRepository tickets, ReservationRepository reservations) {
        this.movies=movies; this.cinemas=cinemas; this.rooms=rooms; this.seats=seats; this.shows=shows; this.tickets=tickets; this.reservations=reservations;
    }
    public static String normalize(String value) { return Normalizer.normalize(value.toLowerCase(Locale.ROOT),Normalizer.Form.NFD).replaceAll("\\p{M}","").replace('đ','d'); }
    public static Instant start(Showtime s) { return s.date.atTime(s.time).atZone(ZONE).toInstant(); }
    public Catalog catalog() { return new Catalog(movieList(null,null),cinemas.findAll().stream().map(CinemaView::new).toList(),rooms.findAll().stream().map(this::view).toList(),showList(null,null,null)); }
    public RoomView view(Room r) { return new RoomView(r.id,r.cinema.id,r.name,r.rows,r.seatsPerRow,seats.findByRoomIdOrderByLabel(r.id).stream().filter(s -> !s.enabled).map(s -> s.label).toList()); }
    public MovieView movie(String id) { return new MovieView(requireMovie(id)); }
    public List<MovieView> movieList(String query,String status) {
        return movies.findAll().stream().filter(m -> status==null || status.equals(m.status)).filter(m -> query==null || normalize(m.title+" "+String.join(" ",m.genres)).contains(normalize(query))).map(MovieView::new).toList();
    }
    public List<ShowtimeView> showList(String movieId,String cinemaId,LocalDate date) {
        return shows.findAll().stream().filter(s -> movieId==null || s.movie.id.equals(movieId)).filter(s -> cinemaId==null || s.room.cinema.id.equals(cinemaId)).filter(s -> date==null || s.date.equals(date)).sorted(Comparator.comparing(CatalogService::start)).map(ShowtimeView::new).toList();
    }
    private Movie requireMovie(String id) { return movies.findById(id).orElseThrow(() -> ApiException.notFound("phim")); }
    private Room lockRoom(String id) { return rooms.lockById(id).orElseThrow(() -> ApiException.notFound("phòng chiếu")); }
    private void lockRooms(List<Showtime> values) { values.stream().map(s -> s.room.id).distinct().sorted().forEach(this::lockRoom); }

    @Transactional(isolation=org.springframework.transaction.annotation.Isolation.READ_COMMITTED) public MovieView saveMovie(String id, Requests.MovieInput input) {
        Movie m = id==null ? new Movie() : movies.lockById(id).orElseThrow(() -> ApiException.notFound("phim"));
        if (input.poster()!=null && !input.poster().isBlank() && !input.poster().matches("^(https?://|/(?!/)).*")) throw ApiException.badRequest("Đường dẫn poster phải dùng http, https hoặc đường dẫn ảnh nội bộ.");
        if (input.trailerUrl()!=null && !input.trailerUrl().isBlank() && !input.trailerUrl().matches("^https://(www\\.)?(youtube-nocookie\\.com|youtube\\.com)/embed/[A-Za-z0-9_-]{11}$")) throw ApiException.badRequest("Trailer cần là liên kết nhúng YouTube hợp lệ.");
        m.title=input.title().trim(); m.poster=Objects.requireNonNullElse(input.poster(),""); m.status=input.status(); m.genres=new ArrayList<>(input.genres().stream().map(String::trim).toList());
        m.duration=input.duration(); m.rating=input.rating(); m.synopsis=input.synopsis().trim(); m.trailerUrl=Objects.requireNonNullElse(input.trailerUrl(),"");
        return new MovieView(movies.save(m));
    }
    @Transactional(isolation=org.springframework.transaction.annotation.Isolation.READ_COMMITTED) public CinemaView saveCinema(String id,Requests.CinemaInput input) {
        Cinema c = id==null ? new Cinema() : cinemas.findById(id).orElseThrow(() -> ApiException.notFound("rạp"));
        c.name=input.name().trim(); c.address=input.address().trim();
        return new CinemaView(cinemas.save(c));
    }
    @Transactional(isolation=org.springframework.transaction.annotation.Isolation.READ_COMMITTED) public RoomView saveRoom(String id,Requests.RoomInput input) {
        Room r = id==null ? new Room() : lockRoom(id);
        Cinema cinema=cinemas.findById(input.cinemaId()).orElseThrow(() -> ApiException.notFound("rạp"));
        boolean shapeChanged=id==null || r.rows!=input.rows() || r.seatsPerRow!=input.seatsPerRow();
        if (id!=null && tickets.existsByShowtimeRoomId(id) && (shapeChanged || !r.cinema.id.equals(cinema.id))) throw ApiException.conflict("Phòng đã có vé. Không thể thay đổi sơ đồ hoặc rạp liên kết.");
        if (id!=null && !r.cinema.id.equals(cinema.id) && shows.existsByRoomId(id)) throw ApiException.conflict("Phòng đang có suất chiếu. Vui lòng xóa các suất chưa có vé trước khi chuyển rạp.");
        r.cinema=cinema; r.name=input.name().trim(); r.rows=input.rows(); r.seatsPerRow=input.seatsPerRow(); rooms.saveAndFlush(r);
        if (shapeChanged) {
            seats.deleteByRoomId(r.id); seats.flush();
            var newSeats=new ArrayList<Seat>();
            for (int row=0;row<r.rows;row++) for (int col=1;col<=r.seatsPerRow;col++) {
                var seat=new Seat(); seat.room=r; seat.label=""+(char)('A'+row)+col; newSeats.add(seat);
            }
            seats.saveAll(newSeats);
        }
        return view(r);
    }
    @Transactional(isolation=org.springframework.transaction.annotation.Isolation.READ_COMMITTED) public RoomView changeSeat(String id,String label,boolean enabled) {
        Room r=lockRoom(id);
        Seat seat=seats.findByRoomIdAndLabel(id,label).orElseThrow(() -> ApiException.notFound("ghế"));
        if (!enabled && reservations.findBySeatRoomId(id).stream().anyMatch(v -> v.seat.id.equals(seat.id) && start(v.showtime).isAfter(Instant.now()) && ("confirmed".equals(v.ticket.status) || ("pending".equals(v.ticket.status) && v.ticket.expiresAt.isAfter(Instant.now())))))
            throw ApiException.conflict("Ghế đang có vé hoặc đang được giữ cho suất sắp chiếu.");
        seat.enabled=enabled; seats.save(seat); return view(r);
    }
    private void removeShows(List<Showtime> values) {
        lockRooms(values);
        if (values.stream().anyMatch(s -> tickets.existsByShowtimeId(s.id))) throw ApiException.conflict("Dữ liệu đã có lịch sử vé nên không thể xóa.");
        shows.deleteAll(values); shows.flush();
    }
    @Transactional(isolation=org.springframework.transaction.annotation.Isolation.READ_COMMITTED) public void deleteMovie(String id) {
        Movie m=movies.lockById(id).orElseThrow(() -> ApiException.notFound("phim")); removeShows(shows.findByMovieId(id)); movies.delete(m);
    }
    @Transactional(isolation=org.springframework.transaction.annotation.Isolation.READ_COMMITTED) public void deleteRoom(String id) {
        Room r=lockRoom(id); removeShows(shows.findByRoomId(id)); seats.deleteByRoomId(id); seats.flush(); rooms.delete(r);
    }
    @Transactional(isolation=org.springframework.transaction.annotation.Isolation.READ_COMMITTED) public void deleteCinema(String id) {
        Cinema c=cinemas.findById(id).orElseThrow(() -> ApiException.notFound("rạp"));
        var all=rooms.findByCinemaId(id); all.stream().map(r->r.id).sorted().forEach(this::lockRoom);
        for (Room r:all) deleteRoom(r.id);
        rooms.flush(); cinemas.delete(c);
    }
}
