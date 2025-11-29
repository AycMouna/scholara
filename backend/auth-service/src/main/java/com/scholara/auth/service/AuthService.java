package com.scholara.auth.service;

import com.scholara.auth.dto.AuthResponse;
import com.scholara.auth.dto.LoginRequest;
import com.scholara.auth.dto.ProfileResponse;
import com.scholara.auth.dto.RegisterRequest;
import com.scholara.auth.model.Role;
import com.scholara.auth.model.User;
import com.scholara.auth.repository.UserRepository;
import com.scholara.auth.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final GoogleAuthService googleAuthService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() == null ? Role.STUDENT : request.getRole())
                .active(true)
                .build();

        userRepository.save(user);
        return buildTokens(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        return buildTokens(user);
    }

    public ProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse authenticateWithGoogle(String credential) {
        var payload = googleAuthService.verify(credential)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Google token"));

        String email = payload.getEmail();
        String fullName = (String) payload.get("name");
        String googleId = payload.getSubject();

        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = User.builder()
                            .fullName(fullName != null ? fullName : email)
                            .email(email)
                            .googleId(googleId)
                            .passwordHash(passwordEncoder.encode("GOOGLE_LOGIN_PLACEHOLDER"))
                            .role(Role.STUDENT)
                            .active(true)
                            .build();
                    return userRepository.save(newUser);
                }));

        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            userRepository.save(user);
        }

        return buildTokens(user);
    }

    private AuthResponse buildTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}

