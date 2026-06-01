package com.inventory.auth.controller;

import com.inventory.auth.dto.request.LoginRequest;
import com.inventory.auth.dto.request.RefreshRequest;
import com.inventory.auth.dto.response.AuthResponse;
import com.inventory.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for login, token refresh, and logout")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and generate JWT & Refresh tokens")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully logged in"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "400", description = "Validation error")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Generate a new access token using a valid refresh token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token successfully refreshed"),
            @ApiResponse(responseCode = "403", description = "Refresh token expired or invalid")
    })
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest refreshRequest) {
        AuthResponse response = authService.refresh(refreshRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate active refresh token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully logged out"),
            @ApiResponse(responseCode = "403", description = "Token error")
    })
    public ResponseEntity<String> logout(@Valid @RequestBody RefreshRequest refreshRequest) {
        authService.logout(refreshRequest.getRefreshToken());
        return ResponseEntity.ok("User logged out successfully");
    }
}
