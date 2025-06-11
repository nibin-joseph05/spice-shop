package com.spiceshop.controllers;

import com.spiceshop.models.User;
import com.spiceshop.repositorys.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpSession;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import com.spiceshop.services.UserService;
import com.spiceshop.models.DeliveryAddress;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "${FRONTEND_URL}", allowCredentials = "true")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        Object userIdObj = session.getAttribute("userId");
        if (userIdObj == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
        }
        Long userId = (Long) userIdObj;
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "User not found"));
        }
        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "user", Map.of(
                        "firstName", user.getFirstName(),
                        "lastName", user.getLastName(),
                        "email", user.getEmail()
                )
        ));
    }

    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateUserProfile(@RequestBody Map<String, String> updateData, HttpSession session) {
        Object userIdObj = session.getAttribute("userId");
        if (userIdObj == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
        }

        Long userId = (Long) userIdObj;
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "User not found"));
        }

        User user = userOpt.get();

        // Validate required fields
        String firstName = updateData.get("firstName");
        String lastName = updateData.get("lastName");

        if (firstName == null || firstName.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "First name is required"));
        }

        if (lastName == null || lastName.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Last name is required"));
        }

        // Update only firstName and lastName - email is not changeable
        user.setFirstName(firstName.trim());
        user.setLastName(lastName.trim());

        try {
            userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile updated successfully",
                    "user", Map.of(
                            "firstName", user.getFirstName(),
                            "lastName", user.getLastName(),
                            "email", user.getEmail()
                    )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Failed to update profile"));
        }
    }


    // Helper method to get userId from session safely
    private Long getUserIdFromSession(HttpSession session) {
        Object userIdObj = session.getAttribute("userId");
        if (userIdObj == null) {
            throw new RuntimeException("User not authenticated.");
        }
        return (Long) userIdObj;
    }

    // Add a new delivery address for the authenticated user
    // POST /api/users/me/addresses
    @PostMapping("/me/addresses")
    public ResponseEntity<Map<String, Object>> addAddressForCurrentUser(@Valid @RequestBody DeliveryAddress address, HttpSession session) {
        try {
            Long userId = getUserIdFromSession(session);
            DeliveryAddress newAddress = userService.addDeliveryAddress(userId, address);
            // Consistent response for success
            return new ResponseEntity<>(Map.of("success", true, "address", newAddress), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Consistent response for error
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Get all delivery addresses for the authenticated user
    // GET /api/users/me/addresses
    @GetMapping("/me/addresses")
    public ResponseEntity<Map<String, Object>> getAllAddressesForCurrentUser(HttpSession session) {
        try {
            Long userId = getUserIdFromSession(session);
            List<DeliveryAddress> addresses = userService.getAllAddressesForUser(userId);
            // Consistent response for success
            return ResponseEntity.ok(Map.of("success", true, "addresses", addresses));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // GET /api/users/me/addresses/{addressId}
    @GetMapping("/me/addresses/{addressId}")
    public ResponseEntity<Map<String, Object>> getAddressByIdForCurrentUser(@PathVariable Long addressId, HttpSession session) {
        try {
            Long userId = getUserIdFromSession(session);
            Optional<DeliveryAddress> addressOpt = userService.getAddressByIdForUser(addressId, userId);
            if (addressOpt.isPresent()) {
                // Consistent response for success
                return ResponseEntity.ok(Map.of("success", true, "address", addressOpt.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Address not found or does not belong to user."));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Update an existing delivery address for the authenticated user
    // PUT /api/users/me/addresses/{addressId}
    @PutMapping("/me/addresses/{addressId}")
    public ResponseEntity<Map<String, Object>> updateAddressForCurrentUser(@PathVariable Long addressId, @Valid @RequestBody DeliveryAddress address, HttpSession session) {
        try {
            Long userId = getUserIdFromSession(session);
            DeliveryAddress updated = userService.updateDeliveryAddress(addressId, userId, address);
            // Consistent response for success
            return ResponseEntity.ok(Map.of("success", true, "address", updated));
        } catch (RuntimeException e) {
            // Use HttpStatus.NOT_FOUND for addresses not found or not belonging to the user
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Delete a delivery address for the authenticated user
    // DELETE /api/users/me/addresses/{addressId}
    @DeleteMapping("/me/addresses/{addressId}")
    public ResponseEntity<Map<String, Object>> deleteAddressForCurrentUser(@PathVariable Long addressId, HttpSession session) {
        try {
            Long userId = getUserIdFromSession(session);
            userService.deleteDeliveryAddress(addressId, userId);
            // For successful deletion, return a success message. NoContent doesn't return a body.
            return ResponseEntity.ok(Map.of("success", true, "message", "Address deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}