package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, String> {
    @org.springframework.data.jpa.repository.Query("select t.showtime.room.id from Ticket t where t.id = :id")
    java.util.Optional<String> roomIdFor(@org.springframework.data.repository.query.Param("id") String id);
    java.util.Optional<Ticket> findByOwnerIdAndIdempotencyKey(String ownerId, String key);
    java.util.List<Ticket> findByShowtimeRoomIdAndStatusAndExpiresAtLessThanEqual(String roomId, String status, java.time.Instant now);
    boolean existsByShowtimeId(String showtimeId);
    boolean existsByShowtimeRoomId(String roomId);
    boolean existsByShowtimeMovieId(String movieId);
}
