package com.spiceshop.controllers;

import com.spiceshop.models.Admin;
import com.spiceshop.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // Endpoint to create a new admin
    @PostMapping("/create")
    public ResponseEntity<Admin> createAdmin(@RequestBody Admin admin) {
        Admin createdAdmin = adminService.createAdmin(admin);
        return ResponseEntity.ok(createdAdmin);
    }

    // Endpoint for admin login (simplified for demonstration)
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String email, @RequestParam String password) {
        boolean isValid = adminService.verifyLogin(email, password);
        if (isValid) {
            return ResponseEntity.ok("Login successful");
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // Endpoint for admin recovery using the secret key
    @PostMapping("/recover")
    public ResponseEntity<Admin> recoverAdmin(@RequestParam String secretKey) {
        Admin admin = adminService.recoverAdmin(secretKey);
        if (admin != null) {
            return ResponseEntity.ok(admin);
        }
        return ResponseEntity.status(404).body(null);
    }
}
