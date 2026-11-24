package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.SeatReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<SeatReservation, String> {
}
