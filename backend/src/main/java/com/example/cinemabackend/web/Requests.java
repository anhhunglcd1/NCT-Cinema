package com.example.cinemabackend.web;
import jakarta.validation.constraints.*;
public final class Requests {
    private Requests() {}
    public record Register(@NotBlank @Size(max=100) String name, @NotBlank @Email @Size(max=254) String email, @NotBlank @Size(min=8,max=72) String password) {}
    public record Login(@NotBlank @Email @Size(max=254) String email, @NotBlank @Size(max=72) String password) {}
}
