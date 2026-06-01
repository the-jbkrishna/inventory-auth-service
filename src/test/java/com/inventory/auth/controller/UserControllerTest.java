package com.inventory.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.auth.dto.request.AssignPermissionsRequest;
import com.inventory.auth.dto.request.CreateUserRequest;
import com.inventory.auth.dto.request.UpdateUserRequest;
import com.inventory.auth.dto.response.UserResponse;
import com.inventory.auth.security.CustomUserDetailsService;
import com.inventory.auth.security.JwtUtils;
import com.inventory.auth.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false) // Bypass security filters for focused controller layer unit testing
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtUtils jwtUtils;

    @Test
    void createUser_Success() throws Exception {
        CreateUserRequest request = CreateUserRequest.builder()
                .username("newuser")
                .password("password123")
                .roleNames(Set.of("ROLE_USER"))
                .build();
        UserResponse response = UserResponse.builder()
                .id(2L)
                .username("newuser")
                .enabled(true)
                .roles(Set.of("ROLE_USER"))
                .build();

        when(userService.createUser(any(CreateUserRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.username").value("newuser"));

        verify(userService, times(1)).createUser(any(CreateUserRequest.class));
    }

    @Test
    void getAllUsers_Success() throws Exception {
        UserResponse user1 = UserResponse.builder().id(1L).username("superadmin").build();
        UserResponse user2 = UserResponse.builder().id(2L).username("newuser").build();

        when(userService.getAllUsers()).thenReturn(List.of(user1, user2));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].username").value("superadmin"))
                .andExpect(jsonPath("$[1].username").value("newuser"));
    }

    @Test
    void getUserById_Success() throws Exception {
        UserResponse response = UserResponse.builder().id(1L).username("superadmin").build();

        when(userService.getUserById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("superadmin"));
    }

    @Test
    void updateUser_Success() throws Exception {
        UpdateUserRequest request = UpdateUserRequest.builder().username("updateduser").build();
        UserResponse response = UserResponse.builder().id(1L).username("updateduser").build();

        when(userService.updateUser(eq(1L), any(UpdateUserRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("updateduser"));
    }

    @Test
    void deleteUser_Success() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());

        verify(userService, times(1)).deleteUser(1L);
    }

    @Test
    void assignPermissions_Success() throws Exception {
        AssignPermissionsRequest request = AssignPermissionsRequest.builder()
                .permissionNames(Set.of("VIEW_PRODUCTS"))
                .build();
        UserResponse response = UserResponse.builder()
                .id(2L)
                .username("newuser")
                .directPermissions(Set.of("VIEW_PRODUCTS"))
                .build();

        when(userService.assignPermissions(eq(2L), any(AssignPermissionsRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/users/2/permissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.directPermissions[0]").value("VIEW_PRODUCTS"));
    }
}
