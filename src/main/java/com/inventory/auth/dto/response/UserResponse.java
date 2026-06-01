package com.inventory.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private boolean enabled;
    private Set<String> roles;
    private Set<String> directPermissions;
    private Set<String> effectivePermissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
