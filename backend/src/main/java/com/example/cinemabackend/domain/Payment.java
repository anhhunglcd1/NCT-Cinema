package com.example.cinemabackend.domain;

import jakarta.persistence.*;

@Entity @Table(name = "nct_payments")
public class Payment extends BaseEntity {
    @OneToOne(optional = false) @JoinColumn(unique = true) public Ticket ticket;
    @Column(nullable = false, length = 20) public String provider;
    @Column(nullable = false, length = 24) public String status = "pending";
    @Column(length = 50) public String transactionNo;
    public java.time.Instant paidAt;
}

