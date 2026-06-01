package com.inventory.auth.config;

import com.inventory.auth.entity.Permission;
import com.inventory.auth.entity.Role;
import com.inventory.auth.entity.User;
import com.inventory.auth.repository.PermissionRepository;
import com.inventory.auth.repository.RoleRepository;
import com.inventory.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking database initialization...");

        // 1. Seed Permissions
        List<String> permissionNames = List.of(
                "VIEW_PRODUCTS", "CREATE_PRODUCTS", "UPDATE_PRODUCTS", "DELETE_PRODUCTS",
                "VIEW_STOCK", "UPDATE_STOCK",
                "VIEW_ORDERS", "CREATE_ORDERS", "DELETE_ORDERS"
        );

        Set<Permission> seededPermissions = new HashSet<>();
        for (String permName : permissionNames) {
            Permission permission = permissionRepository.findByName(permName)
                    .orElseGet(() -> {
                        log.info("Seeding permission: {}", permName);
                        return permissionRepository.save(Permission.builder().name(permName).build());
                    });
            seededPermissions.add(permission);
        }

        // 2. Seed Roles
        Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                .orElseGet(() -> {
                    log.info("Seeding role: ROLE_SUPER_ADMIN");
                    return roleRepository.save(Role.builder()
                            .name("ROLE_SUPER_ADMIN")
                            .permissions(seededPermissions)
                            .build());
                });

        // Ensure Super Admin Role has all permissions mapped
        if (superAdminRole.getPermissions().size() < seededPermissions.size()) {
            superAdminRole.setPermissions(seededPermissions);
            roleRepository.save(superAdminRole);
        }

        roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> {
                    log.info("Seeding role: ROLE_ADMIN");
                    Set<Permission> adminPermissions = new HashSet<>();
                    for (Permission p : seededPermissions) {
                        if (List.of("VIEW_PRODUCTS", "CREATE_PRODUCTS", "UPDATE_PRODUCTS", "DELETE_PRODUCTS", "VIEW_STOCK", "UPDATE_STOCK").contains(p.getName())) {
                            adminPermissions.add(p);
                        }
                    }
                    return roleRepository.save(Role.builder()
                            .name("ROLE_ADMIN")
                            .permissions(adminPermissions)
                            .build());
                });

        roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    log.info("Seeding role: ROLE_USER");
                    Set<Permission> userPermissions = new HashSet<>();
                    for (Permission p : seededPermissions) {
                        if (List.of("VIEW_PRODUCTS", "VIEW_STOCK").contains(p.getName())) {
                            userPermissions.add(p);
                        }
                    }
                    return roleRepository.save(Role.builder()
                            .name("ROLE_USER")
                            .permissions(userPermissions)
                            .build());
                });

        // 3. Seed Super Admin User
        boolean hasSuperAdmin = userRepository.findAll().stream()
                .anyMatch(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName().equals("ROLE_SUPER_ADMIN")));

        if (!hasSuperAdmin) {
            log.info("No SUPER_ADMIN user found. Seeding default superadmin user...");
            User superAdmin = User.builder()
                    .username("superadmin")
                    .password(passwordEncoder.encode("SuperAdmin@123"))
                    .enabled(true)
                    .roles(Set.of(superAdminRole))
                    .permissions(new HashSet<>()) // Eagerly gets from SUPER_ADMIN role
                    .build();
            userRepository.save(superAdmin);
            log.info("Seeded default SUPER_ADMIN user successfully. Username: superadmin, Password: SuperAdmin@123");
        } else {
            log.info("SUPER_ADMIN user already exists. Skipping user seeding.");
        }
    }
}
