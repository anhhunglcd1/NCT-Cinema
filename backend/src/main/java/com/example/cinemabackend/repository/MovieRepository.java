package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepository extends JpaRepository<Movie, String> {
}
