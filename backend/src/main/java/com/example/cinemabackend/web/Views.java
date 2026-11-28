package com.example.cinemabackend.web;
import com.example.cinemabackend.domain.*;
import java.util.List;
import java.time.*;
public final class Views {
    private Views() {}
    public record UserView(String id, String name, String email, String role) {
        public UserView(UserAccount u) { this(u.id, u.name, u.email, u.role); }
    }
    public record MovieView(String id, String title, String poster, String status, List<String> genres, int duration, String rating, String synopsis, String trailerUrl) {
        public MovieView(Movie m) { this(m.id,m.title,m.poster,m.status,List.copyOf(m.genres),m.duration,m.rating,m.synopsis,m.trailerUrl); }
    }
    public record CinemaView(String id, String name, String address) { public CinemaView(Cinema c) { this(c.id,c.name,c.address); } }
    public record RoomView(String id, String cinemaId, String name, int rows, int seatsPerRow, List<String> blockedSeats) {}
    public record ShowtimeView(String id, String movieId, String cinemaId, String roomId, LocalDate date, String time, long price) {
        public ShowtimeView(Showtime s) { this(s.id,s.movie.id,s.room.cinema.id,s.room.id,s.date,s.time.toString(),s.price); }
    }
    public record TicketView(String id, String movieId, String showtimeId, String cinemaId, String roomId, List<String> seats,
        String status, long total, Instant bookedAt, Instant expiresAt, String paymentStatus, String paymentProvider) {
        public TicketView(Ticket t, Payment p) { this(t.id,t.showtime.movie.id,t.showtime.id,t.showtime.room.cinema.id,t.showtime.room.id,List.copyOf(t.seats),t.status,t.total,t.bookedAt,t.expiresAt,p.status,p.provider); }
    }
    public record Catalog(List<MovieView> movies, List<CinemaView> cinemas, List<RoomView> rooms, List<ShowtimeView> showtimes) {}
    public record AdminCatalog(List<MovieView> movies, List<CinemaView> cinemas, List<RoomView> rooms, List<ShowtimeView> showtimes, List<TicketView> tickets) {}
    public record SeatView(String label, String status) {}
    public record Availability(String showtimeId, List<SeatView> seats) {}
}
