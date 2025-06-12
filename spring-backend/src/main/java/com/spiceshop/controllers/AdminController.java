package com.spiceshop.controllers;

import com.spiceshop.models.Admin;
import com.spiceshop.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${FRONTEND_URL}", allowCredentials = "true")
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

    @GetMapping("/profile")
    public ResponseEntity<Admin> getAdminProfile() {
        // In a real application, you'd retrieve the admin based on the authenticated session
        // For now, based on your previous code, it fetches the first admin.
        Admin admin = adminService.getAnyAdminProfile();

        if (admin != null) {
            // For security, you might want to return a DTO that excludes sensitive info like password and secret key
            // unless explicitly requested by a secure endpoint. For this profile view, excluding password is a must.
            // For now, returning the full object as per previous implementation.
            return ResponseEntity.ok(admin);
        }

        return ResponseEntity.status(404).body(null);
    }

    // DTO for password change request
    static class ChangePasswordRequest {
        public String email;
        public String currentPassword;
        public String newPassword;

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody ChangePasswordRequest request) {
        Map<String, String> response = new HashMap<>();

        if (request.getEmail() == null || request.getEmail().isEmpty() ||
                request.getCurrentPassword() == null || request.getCurrentPassword().isEmpty() ||
                request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
            response.put("message", "Email, current password, and new password are required.");
            return ResponseEntity.badRequest().body(response);
        }

        // Basic password complexity validation
        if (!request.getNewPassword().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")) {
            response.put("message", "New password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols.");
            return ResponseEntity.badRequest().body(response);
        }

        boolean changed = adminService.changePassword(request.getEmail(), request.getCurrentPassword(), request.getNewPassword());

        if (changed) {
            response.put("message", "Password changed successfully.");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Failed to change password. Check your current password or if admin exists.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // DTO for updating profile request
    static class UpdateProfileRequest {
        public Long id; // Assuming ID is sent for specific admin update
        public String name;
        public String email;
        public String phone;

        // Getters and Setters (or use Lombok @Data)
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    @PutMapping("/update-profile/{id}")
    public ResponseEntity<Map<String, String>> updateAdminProfile(
            @PathVariable Long id, @RequestBody UpdateProfileRequest request) {
        Map<String, String> response = new HashMap<>();

        // Create an Admin object with only the fields allowed for update
        Admin adminToUpdate = new Admin();
        adminToUpdate.setName(request.getName());
        adminToUpdate.setEmail(request.getEmail());
        adminToUpdate.setPhone(request.getPhone());

        Admin updatedAdmin = adminService.updateAdminProfile(id, adminToUpdate);

        if (updatedAdmin != null) {
            response.put("message", "Profile updated successfully.");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Failed to update profile. Admin not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }


    @PostMapping("/forgot-password/check-email")
    public ResponseEntity<Map<String, String>> checkAdminEmail(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required."));
        }

        boolean exists = adminService.adminEmailExists(email);
        if (exists) {
            return ResponseEntity.ok(Map.of("message", "Email found. Please proceed with your secret key."));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Admin with this email not found."));
        }
    }

    @PostMapping("/forgot-password/request")
    public ResponseEntity<Map<String, String>> requestPasswordReset(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", "false", "message", "Email is required."));
        }

        boolean exists = adminService.adminEmailExists(email);
        if (exists) {

            return ResponseEntity.ok(Map.of("success", "true", "message", "If an admin with that email exists, a secret key has been sent (or is implicitly known)."));
        } else {
            return ResponseEntity.ok(Map.of("success", "false", "message", "Admin with this email not found."));

        }
    }

    @PostMapping("/forgot-password/verify-key")
    public ResponseEntity<Map<String, String>> verifySecretKey(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String secretKey = payload.get("secretKey");

        if (email == null || email.isEmpty() || secretKey == null || secretKey.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", "false", "message", "Email and secret key are required."));
        }

        boolean verified = adminService.verifySecretKeyForEmail(email, secretKey);
        if (verified) {
            return ResponseEntity.ok(Map.of("success", "true", "message", "Secret key verified. Please set your new password."));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", "false", "message", "Invalid email or secret key."));
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String secretKey = payload.get("secretKey");
        String newPassword = payload.get("newPassword");

        if (email == null || email.isEmpty() || secretKey == null || secretKey.isEmpty() || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", "false", "message", "Email, secret key, and new password are all required."));
        }

        // Basic password complexity validation (should match frontend)
        if (!newPassword.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()]).{8,}$")) {
            return ResponseEntity.badRequest().body(Map.of("success", "false", "message", "New password does not meet the requirements."));
        }

        boolean passwordChanged = adminService.resetPasswordWithEmailAndSecretKey(email, secretKey, newPassword);
        if (passwordChanged) {
            return ResponseEntity.ok(Map.of("success", "true", "message", "Password reset successfully. You can now log in with your new password."));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", "false", "message", "Invalid email or secret key. Failed to reset password."));
        }
    }


}
