package com.example.cinemabackend.domain;

import jakarta.persistence.*;

@Entity @Table(name = "nct_movies")
public class Movie extends BaseEntity {
    @Column(nullable = false, length = 150) public String title;
    @Column(length = 800) public String poster = "";
    @Column(nullable = false, length = 20) public String status;
    @ElementCollection(fetch = FetchType.EAGER) @CollectionTable(name = "nct_movie_genres")
    @Column(length = 80) public java.util.List<String> genres = new java.util.ArrayList<>();
    public int duration;
    @Column(length = 8) public String rating;
    @Column(length = 3000) public String synopsis;
    @Column(length = 500) public String trailerUrl = "";
}

