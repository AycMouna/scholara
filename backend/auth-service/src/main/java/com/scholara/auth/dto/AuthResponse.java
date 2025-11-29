package com.scholara.auth.dto;

import com.scholara.auth.model.Role;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthResponse {
    String accessToken;
    String refreshToken;
    Long userId;
    String fullName;
    String email;
    Role role;
}

