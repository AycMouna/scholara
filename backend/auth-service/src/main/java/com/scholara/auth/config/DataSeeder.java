package com.scholara.auth.config;

import com.scholara.auth.model.Role;
import com.scholara.auth.model.User;
import com.scholara.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedAdmin(UserRepository userRepository) {
        return args -> {
            if (userRepository.existsByEmail("admin@scholara.com")) {
                return;
            }

            User admin = User.builder()
                    .fullName("Platform Administrator")
                    .email("admin@scholara.com")
                    .passwordHash(passwordEncoder.encode("Admin#123"))
                    .role(Role.ADMIN)
                    .active(true)
                    .build();

            userRepository.save(admin);
        };
    }
}

