package com.example.cinemabackend.repository;

import com.example.cinemabackend.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserAccount, String> {
    java.util.Optional<UserAccount> findByEmail(String email);
    boolean existsByEmail(String email);
}

