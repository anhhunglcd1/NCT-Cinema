package com.example.cinemabackend.web;
import com.example.cinemabackend.domain.*;
public final class Views {
    private Views() {}
    public record UserView(String id, String name, String email, String role) {
        public UserView(UserAccount u) { this(u.id, u.name, u.email, u.role); }
    }
}
