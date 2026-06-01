package com.inventory.auth.mapper;

import com.inventory.auth.dto.response.UserResponse;
import com.inventory.auth.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-01T23:34:12+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Azul Systems, Inc.)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponse.UserResponseBuilder userResponse = UserResponse.builder();

        userResponse.roles( mapRoles( user.getRoles() ) );
        userResponse.directPermissions( mapPermissions( user.getPermissions() ) );
        userResponse.effectivePermissions( mapEffectivePermissions( user ) );
        userResponse.id( user.getId() );
        userResponse.username( user.getUsername() );
        userResponse.enabled( user.isEnabled() );
        userResponse.createdAt( user.getCreatedAt() );
        userResponse.updatedAt( user.getUpdatedAt() );

        return userResponse.build();
    }
}
