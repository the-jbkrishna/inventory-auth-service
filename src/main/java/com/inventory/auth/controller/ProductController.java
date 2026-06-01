package com.inventory.auth.controller;

import com.inventory.auth.dto.request.ProductRequest;
import com.inventory.auth.entity.Product;
import com.inventory.auth.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Product Management", description = "Endpoints for managing products and stock counts.")
public class ProductController {

    private final ProductRepository productRepository;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEW_PRODUCTS', 'VIEW_STOCK')")
    @Operation(summary = "Retrieve all products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_PRODUCTS')")
    @Operation(summary = "Register a new product")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest request, Authentication authentication) {
        if (productRepository.findByName(request.getName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product with this name already exists");
        }

        Product product = Product.builder()
                .name(request.getName())
                .category(request.getCategory())
                .price(request.getPrice())
                .stock(request.getStock())
                .updatedBy(authentication.getName())
                .build();

        return new ResponseEntity<>(productRepository.save(product), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('UPDATE_PRODUCTS', 'UPDATE_STOCK')")
    @Operation(summary = "Update an existing product or adjust stock")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            Authentication authentication) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // Name change conflict check
        if (!product.getName().equals(request.getName()) && productRepository.findByName(request.getName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product with this name already exists");
        }

        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setUpdatedBy(authentication.getName());

        return ResponseEntity.ok(productRepository.save(product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_PRODUCTS')")
    @Operation(summary = "Delete product by ID")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
