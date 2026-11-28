package com.example.cinemabackend.booking;
import com.example.cinemabackend.web.*;
import com.example.cinemabackend.web.Views.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api")
public class TicketController {
    private final BookingService service;
    public TicketController(BookingService service) { this.service=service; }
    @GetMapping("/showtimes/{id}/seats") public Availability seats(@PathVariable String id) { return service.availability(id); }
    @PostMapping("/tickets") @ResponseStatus(HttpStatus.CREATED) public TicketView reserve(Authentication auth,@Valid @RequestBody Requests.BookingInput input) { return service.reserve(auth,input); }
    @GetMapping("/tickets") public List<TicketView> list(Authentication auth) { return service.list(auth,false); }
    @GetMapping("/tickets/{id}") public TicketView get(Authentication auth,@PathVariable String id) { return service.get(auth,id); }
    @PostMapping("/tickets/{id}/cancel") public TicketView cancel(Authentication auth,@PathVariable String id) { return service.cancel(auth,id); }
}
