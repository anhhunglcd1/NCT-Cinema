package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShowtimeRepository extends JpaRepository<Showtime, String> {
}
