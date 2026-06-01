package com.inventory.auth.mapper;

import com.inventory.auth.dto.response.UserResponse;
import com.inventory.auth.entity.Permission;
import com.inventory.auth.entity.Role;
import com.inventory.auth.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", source = "roles", qualifiedByName = "mapRoles")
    @Mapping(target = "directPermissions", source = "permissions", qualifiedByName = "mapPermissions")
    @Mapping(target = "effectivePermissions", source = "user", qualifiedByName = "mapEffectivePermissions")
    UserResponse toResponse(User user);

    @Named("mapRoles")
    default Set<String> mapRoles(Set<Role> roles) {
        if (roles == null) return new HashSet<>();
        return roles.stream().map(Role::getName).collect(Collectors.toSet());
    }

    @Named("mapPermissions")
    default Set<String> mapPermissions(Set<Permission> permissions) {
        if (permissions == null) return new HashSet<>();
        return permissions.stream().map(Permission::getName).collect(Collectors.toSet());
    }

    @Named("mapEffectivePermissions")
    default Set<String> mapEffectivePermissions(User user) {
        if (user == null) return new HashSet<>();
        Set<String> effective = new HashSet<>();
        
        // Add all permissions from roles
        if (user.getRoles() != null) {
            for (Role role : user.getRoles()) {
                if (role.getPermissions() != null) {
                    for (Permission perm : role.getPermissions()) {
                        effective.add(perm.getName());
                    }
                }
            }
        }
        
        // Add direct permissions
        if (user.getPermissions() != null) {
            for (Permission perm : user.getPermissions()) {
                effective.add(perm.getName());
            }
        }
        
        return effective;
    }
}
