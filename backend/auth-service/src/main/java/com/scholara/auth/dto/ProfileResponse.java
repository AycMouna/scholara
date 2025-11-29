package com.scholara.auth.dto;

import com.scholara.auth.model.Role;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ProfileResponse {
    Long id;
    String fullName;
    String email;
    Role role;
}

