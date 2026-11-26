package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatRepository extends JpaRepository<Seat, String> {
    java.util.List<Seat> findByRoomIdOrderByLabel(String roomId);
}
