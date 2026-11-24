package com.example.cinemabackend.domain;

import jakarta.persistence.*;

@Entity @Table(name = "nct_reservations", uniqueConstraints = @UniqueConstraint(columnNames = {"showtime_id", "seat_id"}))
public class SeatReservation extends BaseEntity {
    @ManyToOne(optional = false) public Showtime showtime;
    @ManyToOne(optional = false) public Seat seat;
    @ManyToOne(optional = false) public Ticket ticket;
}

