package com.inventory.auth.security;

import com.inventory.auth.entity.Permission;
import com.inventory.auth.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class SecurityUser implements UserDetails {

    private final User user;
    private final Set<GrantedAuthority> authorities;

    public SecurityUser(User user) {
        this.user = user;
        
        Set<GrantedAuthority> authoritiesSet = new HashSet<>();
        
        // Add roles as authorities prefixed with ROLE_
        user.getRoles().forEach(role -> {
            authoritiesSet.add(new SimpleGrantedAuthority(role.getName()));
            // Add all permissions associated with this role
            role.getPermissions().forEach(permission -> 
                authoritiesSet.add(new SimpleGrantedAuthority(permission.getName()))
            );
        });

        // Add direct custom permissions assigned to the user
        user.getPermissions().forEach(permission -> 
            authoritiesSet.add(new SimpleGrantedAuthority(permission.getName()))
        );

        this.authorities = authoritiesSet;
    }

    public User getUser() {
        return user;
    }

    public Long getId() {
        return user.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }
}
