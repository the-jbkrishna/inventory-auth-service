package com.inventory.auth.controller;

import com.inventory.auth.dto.request.AssignPermissionsRequest;
import com.inventory.auth.dto.request.CreateUserRequest;
import com.inventory.auth.dto.request.UpdateUserRequest;
import com.inventory.auth.dto.response.UserResponse;
import com.inventory.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "User Management", description = "Endpoints for managing users and permissions. Strictly restricted to SUPER_ADMIN.")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Retrieve all users list")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> response = userService.getAllUsers();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve user details by ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user details (username, enabled status, roles, or password)")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user by ID")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/permissions")
    @Operation(summary = "Assign or revoke direct custom permissions for a specific user")
    public ResponseEntity<UserResponse> assignPermissions(
            @PathVariable Long id,
            @Valid @RequestBody AssignPermissionsRequest request) {
        UserResponse response = userService.assignPermissions(id, request);
        return ResponseEntity.ok(response);
    }
}
