package com.example.cinemabackend.catalog;

import com.example.cinemabackend.domain.*;
import com.example.cinemabackend.repository.*;
import com.example.cinemabackend.web.*;
import com.example.cinemabackend.web.Views.*;
import java.time.*;
import java.text.Normalizer;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional(readOnly=true)
public class CatalogService {
    private final MovieRepository movies; private final CinemaRepository cinemas; private final RoomRepository rooms;
    private final SeatRepository seats; private final ShowtimeRepository shows;
    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    public CatalogService(MovieRepository movies, CinemaRepository cinemas, RoomRepository rooms, SeatRepository seats, ShowtimeRepository shows) {
        this.movies=movies; this.cinemas=cinemas; this.rooms=rooms; this.seats=seats; this.shows=shows;
    }
    public static String normalize(String value) { return Normalizer.normalize(value.toLowerCase(Locale.ROOT),Normalizer.Form.NFD).replaceAll("\\p{M}","").replace('đ','d'); }
    public static Instant start(Showtime s) { return s.date.atTime(s.time).atZone(ZONE).toInstant(); }
    public Catalog catalog() { return new Catalog(movieList(null,null),cinemas.findAll().stream().map(CinemaView::new).toList(),rooms.findAll().stream().map(this::view).toList(),showList(null,null,null)); }
    public RoomView view(Room r) { return new RoomView(r.id,r.cinema.id,r.name,r.rows,r.seatsPerRow,seats.findByRoomIdOrderByLabel(r.id).stream().filter(s -> !s.enabled).map(s -> s.label).toList()); }
    public MovieView movie(String id) { return new MovieView(requireMovie(id)); }
    public List<MovieView> movieList(String query,String status) {
        return movies.findAll().stream().filter(m -> status==null || status.equals(m.status)).filter(m -> query==null || normalize(m.title+" "+String.join(" ",m.genres)).contains(normalize(query))).map(MovieView::new).toList();
    }
    public List<ShowtimeView> showList(String movieId,String cinemaId,LocalDate date) {
        return shows.findAll().stream().filter(s -> movieId==null || s.movie.id.equals(movieId)).filter(s -> cinemaId==null || s.room.cinema.id.equals(cinemaId)).filter(s -> date==null || s.date.equals(date)).sorted(Comparator.comparing(CatalogService::start)).map(ShowtimeView::new).toList();
    }
    private Movie requireMovie(String id) { return movies.findById(id).orElseThrow(() -> ApiException.notFound("phim")); }
}
