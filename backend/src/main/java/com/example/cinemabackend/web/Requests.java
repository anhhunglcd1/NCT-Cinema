package com.example.cinemabackend.web;
import jakarta.validation.constraints.*;
import java.util.List;
public final class Requests {
    private Requests() {}
    public record Register(@NotBlank @Size(max=100) String name, @NotBlank @Email @Size(max=254) String email, @NotBlank @Size(min=8,max=72) String password) {}
    public record Login(@NotBlank @Email @Size(max=254) String email, @NotBlank @Size(max=72) String password) {}
    public record MovieInput(@NotBlank @Size(max=150) String title, @Size(max=800) String poster,
        @NotBlank @Pattern(regexp="nowPlaying|comingSoon") String status, @NotNull @Size(max=12) List<@NotBlank @Size(max=80) String> genres,
        @Min(1) @Max(600) int duration, @NotBlank @Pattern(regexp="P|K|T13|T16|T18") String rating,
        @NotBlank @Size(max=3000) String synopsis, @Size(max=500) String trailerUrl) {}
    public record CinemaInput(@NotBlank @Size(max=100) String name, @NotBlank @Size(max=300) String address) {}
    public record RoomInput(@NotBlank String cinemaId, @NotBlank @Size(max=80) String name, @Min(1) @Max(20) int rows, @Min(1) @Max(24) int seatsPerRow) {}
    public record SeatInput(boolean enabled) {}
    public record BookingInput(@NotBlank String showtimeId, @NotEmpty @Size(max=480) List<@Pattern(regexp="[A-T]([1-9]|1[0-9]|2[0-4])") String> seats,
        @NotBlank @Size(max=80) String idempotencyKey) {}
}
