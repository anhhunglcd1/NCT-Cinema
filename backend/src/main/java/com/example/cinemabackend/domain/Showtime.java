package com.example.cinemabackend.domain;

import jakarta.persistence.*;

@Entity @Table(name = "nct_showtimes", indexes = @Index(columnList = "show_date,show_time"))
public class Showtime extends BaseEntity {
    @ManyToOne(optional = false) public Movie movie;
    @ManyToOne(optional = false) public Room room;
    @Column(name = "show_date", nullable = false) public java.time.LocalDate date;
    @Column(name = "show_time", nullable = false) public java.time.LocalTime time;
    public long price;
}

