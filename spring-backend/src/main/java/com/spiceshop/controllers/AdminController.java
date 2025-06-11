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

      
    @PostMapping("/create")
    public ResponseEntity<Admin> createAdmin(@RequestBody Admin admin) {
        Admin createdAdmin = adminService.createAdmin(admin);
        return ResponseEntity.ok(createdAdmin);
    }

      
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Admin admin, HttpSession session) {
        boolean isValid = adminService.verifyLogin(admin.getEmail(), admin.getPassword());

        Map<String, String> response = new HashMap<>();
        if (isValid) {
            session.setAttribute("adminEmail", admin.getEmail());    
            response.put("message", "Login successful");
            return ResponseEntity.ok(response);
        }
        response.put("message", "Invalid credentials");
        return ResponseEntity.status(401).body(response);
    }


      
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
        session.invalidate();    
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }



}
