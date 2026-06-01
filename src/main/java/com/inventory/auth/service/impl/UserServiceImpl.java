package com.inventory.auth.service.impl;

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
import com.inventory.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + request.getUsername());
        }

        // Fetch specified Roles
        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoleNames()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
            roles.add(role);
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(request.isEnabled())
                .roles(roles)
                .permissions(new HashSet<>()) // Starts with no direct overrides
                .build();

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Update username if provided and distinct
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty() &&
                !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username already exists: " + request.getUsername());
            }
            user.setUsername(request.getUsername());
        }

        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Update enabled status if provided
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        // Update roles if provided
        if (request.getRoleNames() != null) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : request.getRoleNames()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                roles.add(role);
            }
            user.setRoles(roles);
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Prevent deleting the seeded superadmin if it's the only admin left
        if (user.getUsername().equals("superadmin")) {
            throw new IllegalArgumentException("Seeded 'superadmin' user cannot be deleted to ensure system accessibility.");
        }
        
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserResponse assignPermissions(Long id, AssignPermissionsRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        Set<Permission> permissions = new HashSet<>();
        
        // Match and validate requested permissions
        if (request.getPermissionNames() != null && !request.getPermissionNames().isEmpty()) {
            Set<Permission> matchedPermissions = permissionRepository.findByNameIn(request.getPermissionNames());
            
            // Check if any requested permissions are invalid
            if (matchedPermissions.size() < request.getPermissionNames().size()) {
                Set<String> matchedNames = matchedPermissions.stream().map(Permission::getName).collect(Collectors.toSet());
                Set<String> invalidNames = request.getPermissionNames().stream()
                        .filter(name -> !matchedNames.contains(name))
                        .collect(Collectors.toSet());
                throw new ResourceNotFoundException("Permissions not found: " + invalidNames);
            }
            permissions.addAll(matchedPermissions);
        }

        user.setPermissions(permissions);
        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }
}
