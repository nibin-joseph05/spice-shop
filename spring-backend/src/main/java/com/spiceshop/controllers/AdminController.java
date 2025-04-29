package com.spiceshop.controllers;

import com.spiceshop.models.Admin;
import com.spiceshop.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

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
    public ResponseEntity<Map<String, String>> login(@RequestBody Admin admin, HttpSession session) {
        boolean isValid = adminService.verifyLogin(admin.getEmail(), admin.getPassword());

        Map<String, String> response = new HashMap<>();
        if (isValid) {
            session.setAttribute("adminEmail", admin.getEmail());  // store in session
            response.put("message", "Login successful");
            return ResponseEntity.ok(response);
        }
        response.put("message", "Invalid credentials");
        return ResponseEntity.status(401).body(response);
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

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpSession session) {
        session.invalidate();  // clears all session attributes
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }



}
