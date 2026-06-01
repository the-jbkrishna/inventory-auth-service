package com.inventory.auth.service;

import com.inventory.auth.dto.request.AssignPermissionsRequest;
import com.inventory.auth.dto.request.CreateUserRequest;
import com.inventory.auth.dto.request.UpdateUserRequest;
import com.inventory.auth.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse createUser(CreateUserRequest request);
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    void deleteUser(Long id);
    UserResponse assignPermissions(Long id, AssignPermissionsRequest request);
}
