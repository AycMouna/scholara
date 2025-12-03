package com.scholara.auth.controller;

import com.scholara.auth.dto.*;
import com.scholara.auth.service.AuthService;
import com.scholara.auth.model.Role;
import com.scholara.auth.model.User;
import com.scholara.auth.repository.UserRepository;
import com.scholara.auth.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public AuthController(AuthService authService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Value("${admin.email:admin@scholara.com}")
    private String adminEmail;
    
    @Value("${admin.password:admin123}")
    private String adminPassword;
    
    @Value("${admin.fullname:Administrator}")
    private String adminFullname;
    
    @PostConstruct
    public void createDefaultAdmin() {
        System.out.println("Attempting to create default admin user...");
        try {
            if (!userRepository.existsByEmail(adminEmail)) {
                System.out.println("Creating admin user with email: " + adminEmail);
                User admin = User.builder()
                    .fullName(adminFullname)
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
                userRepository.save(admin);
                System.out.println("Default admin user created: " + adminEmail);
            } else {
                System.out.println("Admin user already exists: " + adminEmail);
            }
        } catch (Exception e) {
            System.err.println("Error creating default admin user: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@Valid @RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.authenticateWithGoogle(request.getCredential()));
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> profile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getProfile(userDetails.getUsername()));
    }
}

