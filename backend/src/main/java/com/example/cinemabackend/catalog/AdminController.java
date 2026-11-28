package com.example.cinemabackend.catalog;
import com.example.cinemabackend.booking.BookingService;
import com.example.cinemabackend.web.*;
import com.example.cinemabackend.web.Views.*;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/admin")
public class AdminController {
    private final CatalogService catalog; private final BookingService bookings;
    public AdminController(CatalogService catalog,BookingService bookings) { this.catalog=catalog; this.bookings=bookings; }
    @GetMapping("/catalog") public AdminCatalog catalog(Authentication auth) { var c=catalog.catalog(); return new AdminCatalog(c.movies(),c.cinemas(),c.rooms(),c.showtimes(),bookings.list(auth,true)); }
    @PostMapping("/movies") @ResponseStatus(HttpStatus.CREATED) public MovieView movie(@Valid @RequestBody Requests.MovieInput v) { return catalog.saveMovie(null,v); }
    @PutMapping("/movies/{id}") public MovieView movie(@PathVariable String id,@Valid @RequestBody Requests.MovieInput v) { return catalog.saveMovie(id,v); }
    @DeleteMapping("/movies/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteMovie(@PathVariable String id) { catalog.deleteMovie(id); }
    @PostMapping("/cinemas") @ResponseStatus(HttpStatus.CREATED) public CinemaView cinema(@Valid @RequestBody Requests.CinemaInput v) { return catalog.saveCinema(null,v); }
    @PutMapping("/cinemas/{id}") public CinemaView cinema(@PathVariable String id,@Valid @RequestBody Requests.CinemaInput v) { return catalog.saveCinema(id,v); }
    @DeleteMapping("/cinemas/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteCinema(@PathVariable String id) { catalog.deleteCinema(id); }
    @PostMapping("/rooms") @ResponseStatus(HttpStatus.CREATED) public RoomView room(@Valid @RequestBody Requests.RoomInput v) { return catalog.saveRoom(null,v); }
    @PutMapping("/rooms/{id}") public RoomView room(@PathVariable String id,@Valid @RequestBody Requests.RoomInput v) { return catalog.saveRoom(id,v); }
    @DeleteMapping("/rooms/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteRoom(@PathVariable String id) { catalog.deleteRoom(id); }
    @PatchMapping("/rooms/{id}/seats/{label}") public RoomView seat(@PathVariable String id,@PathVariable String label,@RequestBody Requests.SeatInput v) { return catalog.changeSeat(id,label,v.enabled()); }
    @GetMapping("/tickets") public List<TicketView> tickets(Authentication auth) { return bookings.list(auth,true); }
    @PostMapping("/tickets/{id}/cancel") public TicketView cancel(Authentication auth,@PathVariable String id) { return bookings.cancel(auth,id); }
}
