package com.example.cinemabackend.domain;

import jakarta.persistence.*;

@Entity @Table(name = "nct_users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class UserAccount extends BaseEntity {
    @Column(nullable = false, length = 254) public String email;
    @Column(nullable = false, length = 100) public String name;
    @Column(nullable = false) public String passwordHash;
    @Column(nullable = false, length = 16) public String role = "CUSTOMER";
}

