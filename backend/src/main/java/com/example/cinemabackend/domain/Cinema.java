package com.example.cinemabackend.domain;

import jakarta.persistence.*;

@Entity @Table(name = "nct_cinemas")
public class Cinema extends BaseEntity {
    @Column(nullable = false, length = 100) public String name;
    @Column(nullable = false, length = 300) public String address;
}

