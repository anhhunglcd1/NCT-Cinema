package com.example.cinemabackend.seed;

import com.example.cinemabackend.domain.UserAccount;
import com.example.cinemabackend.repository.UserRepository;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class CatalogSeed implements CommandLineRunner {
    private final UserRepository users; private final PasswordEncoder encoder;
    private final String email, password;
    public CatalogSeed(UserRepository users, PasswordEncoder encoder,
        @Value("${app.admin.email:}") String email, @Value("${app.admin.password:}") String password) {
        this.users = users; this.encoder = encoder; this.email = email; this.password = password;
    }
    @Override @Transactional public void run(String... args) {
        if (!email.isBlank() && !password.isBlank()) {
            String normalized = email.trim().toLowerCase(Locale.ROOT);
            if (password.length() < 12 || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
                throw new IllegalStateException("Mật khẩu bootstrap admin cần từ 12 ký tự và tối đa 72 byte.");
            if (!users.existsByEmail(normalized)) {
                var admin = new UserAccount();
                admin.email = normalized; admin.name = "Quản trị NCT";
                admin.passwordHash = encoder.encode(password); admin.role = "ADMIN";
                users.save(admin);
            }
        }
    }
}
