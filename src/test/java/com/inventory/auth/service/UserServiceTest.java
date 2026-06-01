package com.inventory.auth.service;

import com.inventory.auth.dto.request.AssignPermissionsRequest;
import com.inventory.auth.dto.request.CreateUserRequest;
import com.inventory.auth.dto.request.UpdateUserRequest;
import com.inventory.auth.dto.response.UserResponse;
import com.inventory.auth.entity.Permission;
import com.inventory.auth.entity.Role;
import com.inventory.auth.entity.User;
import com.inventory.auth.exception.ResourceNotFoundException;
import com.inventory.auth.mapper.UserMapper;
import com.inventory.auth.repository.PermissionRepository;
import com.inventory.auth.repository.RoleRepository;
import com.inventory.auth.repository.UserRepository;
import com.inventory.auth.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;
    private Role role;
    private Permission permission;

    @BeforeEach
    void setUp() {
        permission = Permission.builder().id(1L).name("VIEW_PRODUCTS").build();
        role = Role.builder().id(1L).name("ROLE_USER").permissions(Set.of(permission)).build();
        user = User.builder().id(1L).username("testuser").password("encodedPass").roles(Set.of(role)).build();
    }

    @Test
    void createUser_Success() {
        CreateUserRequest request = CreateUserRequest.builder()
                .username("newuser")
                .password("password123")
                .roleNames(Set.of("ROLE_USER"))
                .build();

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("password123")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserResponse expectedResponse = UserResponse.builder().id(1L).username("newuser").build();
        when(userMapper.toResponse(any(User.class))).thenReturn(expectedResponse);

        UserResponse response = userService.createUser(request);

        assertNotNull(response);
        assertEquals("newuser", response.getUsername());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void createUser_DuplicateUsername_ThrowsException() {
        CreateUserRequest request = CreateUserRequest.builder()
                .username("testuser")
                .password("password123")
                .roleNames(Set.of("ROLE_USER"))
                .build();

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        UserResponse expectedResponse = UserResponse.builder().id(1L).username("testuser").build();
        when(userMapper.toResponse(user)).thenReturn(expectedResponse);

        UserResponse response = userService.getUserById(1L);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
    }

    @Test
    void getUserById_NotFound_ThrowsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(99L));
    }

    @Test
    void assignPermissions_Success() {
        AssignPermissionsRequest request = AssignPermissionsRequest.builder()
                .permissionNames(Set.of("VIEW_PRODUCTS"))
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(permissionRepository.findByNameIn(Set.of("VIEW_PRODUCTS"))).thenReturn(Set.of(permission));
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserResponse expectedResponse = UserResponse.builder().id(1L).username("testuser").build();
        when(userMapper.toResponse(any(User.class))).thenReturn(expectedResponse);

        UserResponse response = userService.assignPermissions(1L, request);

        assertNotNull(response);
        verify(userRepository, times(1)).save(any(User.class));
    }
}
