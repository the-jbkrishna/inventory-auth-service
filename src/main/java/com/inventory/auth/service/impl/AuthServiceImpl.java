package com.inventory.auth.service.impl;

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
import com.inventory.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Value("${app.jwt.refresh-expiration-ms}")
    private Long refreshExpirationMs;

    @Value("${app.jwt.access-expiration-ms}")
    private Long accessExpirationMs;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        // Authenticate credentials
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        User user = securityUser.getUser();

        // Resolve highest privilege role name (e.g. ROLE_SUPER_ADMIN or ROLE_USER)
        String roleName = user.getRoles().stream()
                .map(Role::getName)
                .filter(name -> name.equals("ROLE_SUPER_ADMIN"))
                .findFirst()
                .orElseGet(() -> user.getRoles().stream()
                        .map(Role::getName)
                        .findFirst()
                        .orElse("ROLE_USER")
                );

        // Resolve distinct permissions list (union of role permissions + direct permissions)
        List<String> permissions = securityUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> !auth.startsWith("ROLE_"))
                .distinct()
                .collect(Collectors.toList());

        // Generate Access Token
        String accessToken = jwtUtils.generateAccessToken(user.getUsername(), roleName, permissions);

        // Generate or Rotate Refresh Token
        RefreshToken refreshToken = getOrCreateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .expiryDurationMs(accessExpirationMs)
                .username(user.getUsername())
                .role(roleName)
                .permissions(permissions)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshRequest refreshRequest) {
        String tokenStr = refreshRequest.getRefreshToken();

        // 1. Fetch token from database
        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new TokenRefreshException(tokenStr, "Refresh token is not in database!"));

        // 2. Verify token expiration
        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException(tokenStr, "Refresh token has expired. Please sign in again.");
        }

        User user = refreshToken.getUser();

        // Resolve role
        String roleName = user.getRoles().stream()
                .map(Role::getName)
                .filter(name -> name.equals("ROLE_SUPER_ADMIN"))
                .findFirst()
                .orElseGet(() -> user.getRoles().stream()
                        .map(Role::getName)
                        .findFirst()
                        .orElse("ROLE_USER")
                );

        // Resolve authorities
        SecurityUser securityUser = new SecurityUser(user);
        List<String> permissions = securityUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> !auth.startsWith("ROLE_"))
                .distinct()
                .collect(Collectors.toList());

        // Generate new Access Token
        String newAccessToken = jwtUtils.generateAccessToken(user.getUsername(), roleName, permissions);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .expiryDurationMs(accessExpirationMs)
                .username(user.getUsername())
                .role(roleName)
                .permissions(permissions)
                .build();
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.deleteByToken(refreshToken);
    }

    private RefreshToken getOrCreateRefreshToken(User user) {
        // Reuse or create a new token
        Optional<RefreshToken> existingTokenOpt = refreshTokenRepository.findByToken(
                refreshTokenRepository.findAll().stream()
                        .filter(t -> t.getUser().getId().equals(user.getId()))
                        .map(RefreshToken::getToken)
                        .findFirst()
                        .orElse("")
        );

        RefreshToken refreshToken;
        if (existingTokenOpt.isPresent()) {
            refreshToken = existingTokenOpt.get();
            refreshToken.setToken(UUID.randomUUID().toString());
            refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));
        } else {
            refreshToken = RefreshToken.builder()
                    .user(user)
                    .token(UUID.randomUUID().toString())
                    .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                    .build();
        }

        return refreshTokenRepository.save(refreshToken);
    }
}
