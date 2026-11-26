package com.example.cinemabackend.web;
import jakarta.validation.constraints.*;
import java.util.List;
public final class Requests {
    private Requests() {}
    public record Register(@NotBlank @Size(max=100) String name, @NotBlank @Email @Size(max=254) String email, @NotBlank @Size(min=8,max=72) String password) {}
    public record Login(@NotBlank @Email @Size(max=254) String email, @NotBlank @Size(max=72) String password) {}
    public record BookingInput(@NotBlank String showtimeId, @NotEmpty @Size(max=480) List<@Pattern(regexp="[A-T]([1-9]|1[0-9]|2[0-4])") String> seats,
        @NotBlank @Size(max=80) String idempotencyKey) {}
}
