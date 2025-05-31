package com.spiceshop.controllers;

import com.spiceshop.dto.*;
import com.spiceshop.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "${FRONTEND_URL}")
public class CartController {

    private final CartService cartService;

    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDTO> getCart(Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        CartDTO cart = cartService.getCartDetails(userId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addToCart(
            Principal principal,
            @RequestBody AddToCartRequest request) {
        Long userId = getUserIdFromPrincipal(principal);
        cartService.addItemToCart(userId, request);
        CartDTO cart = cartService.getCartDetails(userId);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDTO> updateCartItem(
            Principal principal,
            @PathVariable Long itemId,
            @RequestBody UpdateCartItemRequest request) {
        Long userId = getUserIdFromPrincipal(principal);
        cartService.updateCartItemQuantity(userId, itemId, request);
        CartDTO cart = cartService.getCartDetails(userId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDTO> removeCartItem(
            Principal principal,
            @PathVariable Long itemId) {
        Long userId = getUserIdFromPrincipal(principal);
        cartService.removeItemFromCart(userId, itemId);
        CartDTO cart = cartService.getCartDetails(userId);
        return ResponseEntity.ok(cart);
    }

    private Long getUserIdFromPrincipal(Principal principal) {
        // Implement logic to get user ID from authentication principal
        // For example, if using JWT:
        // return ((UserDetails) principal).getId();
        return 1L; // Placeholder - replace with actual user ID retrieval
    }


    @GetMapping("/count")
    public ResponseEntity<Integer> getCartItemCount(Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        int count = cartService.getCartItemCount(userId);
        return ResponseEntity.ok(count);
    }
}