package com.fixitnow.backend.controller;

import com.fixitnow.backend.controller.dto.AuthDtos.AuthResponse;
import com.fixitnow.backend.controller.dto.AuthDtos.LoginRequest;
import com.fixitnow.backend.controller.dto.AuthDtos.RegisterRequest;
import com.fixitnow.backend.model.User;
import com.fixitnow.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(
                request.fullName(),
                request.email(),
                request.phone(),
                request.password(),
                request.role()
        );
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request.email(), request.password());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}


