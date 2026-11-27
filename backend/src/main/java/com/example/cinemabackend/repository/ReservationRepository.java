package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.SeatReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<SeatReservation, String> {
    java.util.List<SeatReservation> findByShowtimeId(String showtimeId);
    java.util.List<SeatReservation> findBySeatRoomId(String roomId);
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("delete from SeatReservation r where r.ticket.id = :id")
    void release(@org.springframework.data.repository.query.Param("id") String ticketId);
}

