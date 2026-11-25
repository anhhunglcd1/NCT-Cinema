package com.example.cinemabackend.auth;

import com.example.cinemabackend.domain.UserAccount;
import com.example.cinemabackend.repository.UserRepository;
import com.example.cinemabackend.web.*;
import com.example.cinemabackend.web.Views.UserView;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users; private final PasswordEncoder encoder; private final AuthenticationManager manager;
    private final SecurityContextRepository contexts; private final SessionAuthenticationStrategy strategy;
    public AuthController(UserRepository users, PasswordEncoder encoder, AuthenticationManager manager, SecurityContextRepository contexts, SessionAuthenticationStrategy strategy) {
        this.users=users; this.encoder=encoder; this.manager=manager; this.contexts=contexts; this.strategy=strategy;
    }
    @GetMapping("/csrf") public Map<String,String> csrf(CsrfToken token) { return Map.of("token",token.getToken(),"headerName",token.getHeaderName()); }
    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) @Transactional
    public UserView register(@Valid @RequestBody Requests.Register input) {
        String email = input.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) throw ApiException.conflict("Email đã được sử dụng.");
        if (input.name().isBlank() || input.password().getBytes(StandardCharsets.UTF_8).length > 72) throw ApiException.badRequest("Tên không được trống; mật khẩu tối đa 72 byte UTF-8.");
        var user = new UserAccount(); user.email=email; user.name=input.name().trim(); user.passwordHash=encoder.encode(input.password());
        return new UserView(users.saveAndFlush(user));
    }
    @PostMapping("/login")
    public UserView login(@Valid @RequestBody Requests.Login input, HttpServletRequest request, HttpServletResponse response) {
        if (input.password().getBytes(StandardCharsets.UTF_8).length > 72) throw ApiException.badRequest("Mật khẩu quá dài.");
        Authentication auth = manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(input.email().trim().toLowerCase(Locale.ROOT),input.password()));
        strategy.onAuthentication(auth,request,response);
        var context = SecurityContextHolder.createEmptyContext(); context.setAuthentication(auth);
        SecurityContextHolder.setContext(context); contexts.saveContext(context,request,response);
        return new UserView(users.findByEmail(auth.getName()).orElseThrow());
    }
    @GetMapping("/me") public UserView me(Authentication auth) { return new UserView(users.findByEmail(auth.getName()).orElseThrow()); }
}

