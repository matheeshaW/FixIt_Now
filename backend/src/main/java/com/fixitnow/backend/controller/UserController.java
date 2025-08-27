package com.fixitnow.backend.controller;

import com.fixitnow.backend.model.User;
import com.fixitnow.backend.service.UserService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetails principal) {
        User user = userService.getByEmail(principal.getUsername());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal UserDetails principal,
                                              @RequestBody Map<String, String> payload) {
        String fullName = payload.getOrDefault("fullName", "");
        String phone = payload.getOrDefault("phone", "");
        User updated = userService.updateProfile(principal.getUsername(), fullName, phone);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/me/reset-password")
    public ResponseEntity<Void> resetPassword(@AuthenticationPrincipal UserDetails principal,
                                              @RequestBody Map<String, String> payload) {
        String newPassword = payload.get("newPassword");
        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        userService.resetPassword(principal.getUsername(), newPassword);
        return ResponseEntity.ok().build();
    }
}


