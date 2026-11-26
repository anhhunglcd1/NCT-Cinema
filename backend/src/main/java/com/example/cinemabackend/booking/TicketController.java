package com.example.cinemabackend.booking;
import com.example.cinemabackend.web.*;
import com.example.cinemabackend.web.Views.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api")
public class TicketController {
    private final BookingService service;
    public TicketController(BookingService service) { this.service=service; }
    @GetMapping("/showtimes/{id}/seats") public Availability seats(@PathVariable String id) { return service.availability(id); }
    @PostMapping("/tickets") @ResponseStatus(HttpStatus.CREATED) public TicketView reserve(Authentication auth,@Valid @RequestBody Requests.BookingInput input) { return service.reserve(auth,input); }
}
