package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CinemaRepository extends JpaRepository<Cinema, String> {
    
}

