package com.example.cinemabackend.domain;

import jakarta.persistence.*;

@Entity @Table(name = "nct_tickets", indexes = @Index(columnList = "status,expires_at"), uniqueConstraints = @UniqueConstraint(columnNames = {"owner_id", "idempotency_key"}))
public class Ticket extends BaseEntity {
    @ManyToOne(optional = false) public UserAccount owner;
    @ManyToOne(optional = false) public Showtime showtime;
    @ElementCollection(fetch = FetchType.EAGER) @CollectionTable(name = "nct_ticket_labels")
    @Column(name = "seat_label", length = 5) public java.util.List<String> seats = new java.util.ArrayList<>();
    @Column(nullable = false, length = 20) public String status = "pending";
    public long total;
    @Column(nullable = false) public java.time.Instant bookedAt;
    @Column(name = "expires_at", nullable = false) public java.time.Instant expiresAt;
    @Column(name = "idempotency_key", nullable = false, length = 80) public String idempotencyKey;
}

