package com.spiceshop.controllers;

import com.spiceshop.dto.*;
import com.spiceshop.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "${FRONTEND_URL}")
public class CartController {

    private final CartService cartService;
    private final HttpSession httpSession;

    @Autowired
    public CartController(CartService cartService, HttpSession httpSession) {
        this.cartService = cartService;
        this.httpSession = httpSession;
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
        Object userIdObj = httpSession.getAttribute("userId");
        if (userIdObj instanceof Long) {
            return (Long) userIdObj;
        }

        throw new SecurityException("User not authenticated or userId not found in session.");
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCartItemCount(Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        int count = cartService.getCartItemCount(userId);
        return ResponseEntity.ok(count);
    }
}