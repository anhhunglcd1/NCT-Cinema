package com.example.cinemabackend.domain;

import jakarta.persistence.*;

@Entity @Table(name = "nct_rooms", uniqueConstraints = @UniqueConstraint(columnNames = {"cinema_id", "name"}))
public class Room extends BaseEntity {
    @ManyToOne(optional = false) public Cinema cinema;
    @Column(nullable = false, length = 80) public String name;
    @Column(name = "row_count") public int rows;
    public int seatsPerRow;
}

