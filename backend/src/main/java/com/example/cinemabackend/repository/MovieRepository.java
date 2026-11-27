package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepository extends JpaRepository<Movie, String> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select m from Movie m where m.id = :id")
    java.util.Optional<Movie> lockById(@org.springframework.data.repository.query.Param("id") String id);
    
}

