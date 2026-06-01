package com.inventory.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.auth.dto.request.LoginRequest;
import com.inventory.auth.dto.request.RefreshRequest;
import com.inventory.auth.dto.response.AuthResponse;
import com.inventory.auth.security.CustomUserDetailsService;
import com.inventory.auth.security.JwtUtils;
import com.inventory.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Bypass security filters for focused controller layer unit testing
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtUtils jwtUtils;

    @Test
    void login_Success() throws Exception {
        LoginRequest request = LoginRequest.builder().username("superadmin").password("password123").build();
        AuthResponse response = AuthResponse.builder()
                .accessToken("access-token-str")
                .refreshToken("refresh-token-str")
                .username("superadmin")
                .role("ROLE_SUPER_ADMIN")
                .permissions(List.of("VIEW_PRODUCTS"))
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token-str"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token-str"))
                .andExpect(jsonPath("$.username").value("superadmin"));

        verify(authService, times(1)).login(any(LoginRequest.class));
    }

    @Test
    void login_ValidationError_BlankUsername() throws Exception {
        LoginRequest request = LoginRequest.builder().username("").password("password123").build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).login(any(LoginRequest.class));
    }

    @Test
    void refresh_Success() throws Exception {
        RefreshRequest request = RefreshRequest.builder().refreshToken("refresh-token-str").build();
        AuthResponse response = AuthResponse.builder()
                .accessToken("new-access-token")
                .refreshToken("refresh-token-str")
                .build();

        when(authService.refresh(any(RefreshRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"));
    }

    @Test
    void logout_Success() throws Exception {
        RefreshRequest request = RefreshRequest.builder().refreshToken("refresh-token-str").build();

        doNothing().when(authService).logout("refresh-token-str");

        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("User logged out successfully"));

        verify(authService, times(1)).logout("refresh-token-str");
    }
}
