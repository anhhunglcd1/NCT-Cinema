package com.example.cinemabackend.domain;

import jakarta.persistence.*;

@Entity @Table(name = "nct_seats", uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "label"}))
public class Seat extends BaseEntity {
    @ManyToOne(optional = false) public Room room;
    @Column(nullable = false, length = 5) public String label;
    public boolean enabled = true;
}

