package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShowtimeRepository extends JpaRepository<Showtime, String> {
    @org.springframework.data.jpa.repository.Query("select s.room.id from Showtime s where s.id = :id")
    java.util.Optional<String> roomIdFor(@org.springframework.data.repository.query.Param("id") String id);
}
