package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, String> {
    java.util.Optional<Payment> findByTicketId(String ticketId);
}

