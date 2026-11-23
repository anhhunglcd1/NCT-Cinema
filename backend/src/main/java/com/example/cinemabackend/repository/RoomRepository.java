package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, String> {
}
