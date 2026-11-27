package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, String> {
    java.util.List<Room> findByCinemaId(String cinemaId);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select r from Room r where r.id = :id")
    java.util.Optional<Room> lockById(@org.springframework.data.repository.query.Param("id") String id);
}

