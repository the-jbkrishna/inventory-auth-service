package com.inventory.auth.service;

import com.inventory.auth.dto.request.LoginRequest;
import com.inventory.auth.dto.request.RefreshRequest;
import com.inventory.auth.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    AuthResponse refresh(RefreshRequest refreshRequest);
    void logout(String refreshToken);
}
