package com.example.cinemabackend.seed;

import com.example.cinemabackend.catalog.CatalogService;
import com.example.cinemabackend.domain.*;
import com.example.cinemabackend.repository.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Component
public class CatalogSeed implements CommandLineRunner {
    private final UserRepository users; private final PasswordEncoder encoder; private final MovieRepository movies;
    private final CinemaRepository cinemas; private final RoomRepository rooms; private final SeatRepository seats;
    private final ShowtimeRepository shows; private final ObjectMapper json; private final boolean enabled; private final String email,password;
    public CatalogSeed(UserRepository users,PasswordEncoder encoder,MovieRepository movies,CinemaRepository cinemas,RoomRepository rooms,SeatRepository seats,ShowtimeRepository shows,ObjectMapper json,
        @Value("${app.seed:false}") boolean enabled,@Value("${app.admin.email:}") String email,@Value("${app.admin.password:}") String password) {
        this.users=users; this.encoder=encoder; this.movies=movies; this.cinemas=cinemas; this.rooms=rooms; this.seats=seats; this.shows=shows; this.json=json; this.enabled=enabled; this.email=email; this.password=password;
    }
    @Override @Transactional public void run(String... args) throws Exception {
        if (!email.isBlank() && !password.isBlank()) {
            String normalized=email.trim().toLowerCase(Locale.ROOT);
            if (password.length()<12 || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72) throw new IllegalStateException("Mật khẩu bootstrap admin cần từ 12 ký tự và tối đa 72 byte.");
            if (!users.existsByEmail(normalized)) {
                var admin=new UserAccount(); admin.email=normalized; admin.name="Quản trị NCT"; admin.passwordHash=encoder.encode(password); admin.role="ADMIN"; users.save(admin);
            }
        }
        if (!enabled || movies.count()>0 || cinemas.count()>0 || rooms.count()>0 || shows.count()>0) return;
        try (var input=new ClassPathResource("seed-catalog.json").getInputStream()) {
            var seed=json.readTree(input);
            for (var node:seed.get("movies")) {
                Movie m=new Movie(); m.id=node.get("id").asString(); m.title=node.get("title").asString(); m.poster=node.get("poster").asString();
                m.status=node.get("status").asString(); m.duration=node.get("duration").asInt(); m.rating=node.get("rating").asString();
                m.synopsis=node.get("synopsis").asString(); m.trailerUrl=node.get("trailerUrl").asString();
                for (var genre:node.get("genres")) m.genres.add(genre.asString());
                movies.save(m);
            }
            for (var node:seed.get("cinemas")) {
                Cinema c=new Cinema(); c.id=node.get("id").asString(); c.name=node.get("name").asString(); c.address=node.get("address").asString(); cinemas.save(c);
            }
            for (var node:seed.get("rooms")) {
                Room r=new Room();
                r.cinema=cinemas.findById(node.get("cinemaId").asString()).orElseThrow();
                r.name=node.get("name").asString(); r.rows=node.get("rows").asInt(); r.seatsPerRow=node.get("seatsPerRow").asInt();
                rooms.saveAndFlush(r);
                var newSeats=new ArrayList<Seat>();
                for (int row=0;row<r.rows;row++) for (int col=1;col<=r.seatsPerRow;col++) {
                    var seat=new Seat(); seat.room=r; seat.label=""+(char)('A'+row)+col; newSeats.add(seat);
                }
                seats.saveAll(newSeats);
            }
            var allMovies=movies.findAll(); var allRooms=rooms.findAll(); LocalDate today=LocalDate.now(CatalogService.ZONE);
            Map<String,Integer> indexes=new HashMap<>();
            for (Movie m:allMovies) {
                int index=indexes.getOrDefault(m.status,0);
                for (Room r:allRooms) for (int day=0;day<7;day++) {
                    Showtime s=new Showtime(); s.id=m.id+"-"+r.id+"-"+day; s.movie=m; s.room=r;
                    s.date=today.plusDays(day+("comingSoon".equals(m.status)?7:0)); s.time=LocalTime.of(9+(index%4)*4,0); s.price=85000;
                    shows.save(s);
                }
                indexes.put(m.status,index+1);
            }
        }
    }
}
