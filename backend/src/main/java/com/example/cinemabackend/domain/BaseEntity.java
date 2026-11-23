package com.example.cinemabackend.domain;

import jakarta.persistence.*;

@MappedSuperclass
public abstract class BaseEntity {
    @Id @Column(length = 80) public String id = java.util.UUID.randomUUID().toString();
    @Version public Long version;
}

