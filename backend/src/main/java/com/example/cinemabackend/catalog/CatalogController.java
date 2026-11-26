package com.example.cinemabackend.catalog;
import com.example.cinemabackend.web.Views.*;
import java.time.LocalDate;
import java.util.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api")
public class CatalogController {
    private final CatalogService service;
    public CatalogController(CatalogService service) { this.service=service; }
    @GetMapping("/health") public Map<String,String> health() { return Map.of("status","UP"); }
    @GetMapping("/catalog") public Catalog catalog() { return service.catalog(); }
    @GetMapping("/movies") public List<MovieView> movies(@RequestParam(required=false) String query,@RequestParam(required=false) String status) { return service.movieList(query,status); }
    @GetMapping("/movies/{id}") public MovieView movie(@PathVariable String id) { return service.movie(id); }
    @GetMapping("/showtimes") public List<ShowtimeView> showtimes(@RequestParam(required=false) String movieId,@RequestParam(required=false) String cinemaId,@RequestParam(required=false) LocalDate date) { return service.showList(movieId,cinemaId,date); }
}

