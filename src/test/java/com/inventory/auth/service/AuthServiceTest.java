package com.inventory.auth.service;

import com.inventory.auth.dto.request.LoginRequest;
import com.inventory.auth.dto.request.RefreshRequest;
import com.inventory.auth.dto.response.AuthResponse;
import com.inventory.auth.entity.Permission;
import com.inventory.auth.entity.RefreshToken;
import com.inventory.auth.entity.Role;
import com.inventory.auth.entity.User;
import com.inventory.auth.exception.TokenRefreshException;
import com.inventory.auth.repository.RefreshTokenRepository;
import com.inventory.auth.repository.UserRepository;
import com.inventory.auth.security.JwtUtils;
import com.inventory.auth.security.SecurityUser;
import com.inventory.auth.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;
    private RefreshToken refreshToken;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "refreshExpirationMs", 604800000L);
        ReflectionTestUtils.setField(authService, "accessExpirationMs", 900000L);

        Permission permission = Permission.builder().id(1L).name("VIEW_PRODUCTS").build();
        Role role = Role.builder().id(1L).name("ROLE_USER").permissions(Set.of(permission)).build();
        user = User.builder().id(1L).username("testuser").password("encodedPass").roles(Set.of(role)).build();
        refreshToken = RefreshToken.builder().id(1L).token("uuid-token-str").user(user).expiryDate(Instant.now().plusSeconds(60)).build();
    }

    @Test
    void login_Success() {
        LoginRequest request = LoginRequest.builder().username("testuser").password("password123").build();
        Authentication auth = mock(Authentication.class);
        SecurityUser securityUser = new SecurityUser(user);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(auth.getPrincipal()).thenReturn(securityUser);
        when(jwtUtils.generateAccessToken(eq("testuser"), anyString(), anyList())).thenReturn("mockJwtToken");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(refreshToken);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getAccessToken());
        assertEquals("uuid-token-str", response.getRefreshToken());
        assertEquals("testuser", response.getUsername());
        assertEquals("ROLE_USER", response.getRole());
        assertTrue(response.getPermissions().contains("VIEW_PRODUCTS"));
    }

    @Test
    void refresh_Success() {
        RefreshRequest request = RefreshRequest.builder().refreshToken("uuid-token-str").build();

        when(refreshTokenRepository.findByToken("uuid-token-str")).thenReturn(Optional.of(refreshToken));
        when(jwtUtils.generateAccessToken(eq("testuser"), anyString(), anyList())).thenReturn("newJwtToken");

        AuthResponse response = authService.refresh(request);

        assertNotNull(response);
        assertEquals("newJwtToken", response.getAccessToken());
        assertEquals("uuid-token-str", response.getRefreshToken());
    }

    @Test
    void refresh_ExpiredToken_ThrowsException() {
        RefreshRequest request = RefreshRequest.builder().refreshToken("uuid-token-str").build();
        refreshToken.setExpiryDate(Instant.now().minusSeconds(10)); // expired

        when(refreshTokenRepository.findByToken("uuid-token-str")).thenReturn(Optional.of(refreshToken));

        assertThrows(TokenRefreshException.class, () -> authService.refresh(request));
        verify(refreshTokenRepository, times(1)).delete(refreshToken);
    }

    @Test
    void refresh_TokenNotFound_ThrowsException() {
        RefreshRequest request = RefreshRequest.builder().refreshToken("unknown-token").build();

        when(refreshTokenRepository.findByToken("unknown-token")).thenReturn(Optional.empty());

        assertThrows(TokenRefreshException.class, () -> authService.refresh(request));
    }

    @Test
    void logout_Success() {
        authService.logout("uuid-token-str");
        verify(refreshTokenRepository, times(1)).deleteByToken("uuid-token-str");
    }
}
