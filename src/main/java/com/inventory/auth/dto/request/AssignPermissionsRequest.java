package com.inventory.auth.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignPermissionsRequest {

    @NotNull(message = "Permission names set cannot be null")
    private Set<String> permissionNames;
}
