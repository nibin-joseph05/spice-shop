package com.spiceshop.controllers;

import com.spiceshop.services.OTPService;
import com.spiceshop.services.UserService;
import com.spiceshop.services.EmailService;
import com.spiceshop.models.User;
import com.spiceshop.repositorys.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import jakarta.servlet.http.HttpSession;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${FRONTEND_URL}")
public class AuthController {

    private final UserService userService;
    private final OTPService otpService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserService userService,
                          OTPService otpService,
                          EmailService emailService,
                          UserRepository userRepository,
                          BCryptPasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.otpService = otpService;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOTP(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        if (otpService.isOTPRequestBlocked(email)) {
            return ResponseEntity.status(429).body(
                    Map.of("success", false, "message", "Too many requests. Please try again later.")
            );
        }

        if (userService.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Email already registered")
            );
        }

        String otp = otpService.generateOTP(email);
        emailService.sendRegistrationOTP(email, otp);
        return ResponseEntity.ok(
                Map.of("success", true, "message", "OTP sent successfully")
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String otp = body.get("otp");

            if (email == null || otp == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("success", false, "message", "Email and OTP are required")
                );
            }

            if (!otpService.validateOTP(email, otp)) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Invalid or expired OTP")
                );
            }

            return ResponseEntity.ok(
                    Map.of("success", true, "message", "OTP verified successfully")
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("success", false, "message", "Server error during OTP verification")
            );
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> body,
            HttpSession session
    ) {
          
        Object userId = session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(
                    Map.of("success", false, "message", "Not authenticated")
            );
        }

          
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

          
        if (currentPassword == null || currentPassword.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Current password is required")
            );
        }

        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "New password is required")
            );
        }

          
        String passwordValidationError = validatePasswordStrength(newPassword);
        if (passwordValidationError != null) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", passwordValidationError)
            );
        }

        try {
              
            Optional<User> userOpt = userRepository.findById((Long) userId);
            if (userOpt.isEmpty()) {
                  
                session.invalidate();
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "User not found")
                );
            }

            User user = userOpt.get();

              
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Current password is incorrect")
                );
            }

              
            if (passwordEncoder.matches(newPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(
                        Map.of("success", false, "message", "New password must be different from current password")
                );
            }

              
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return ResponseEntity.ok(
                    Map.of("success", true, "message", "Password changed successfully")
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("success", false, "message", "An error occurred while changing password")
            );
        }
    }

    private String validatePasswordStrength(String password) {
        if (password.length() < 8) {
            return "Password must be at least 8 characters long";
        }

        if (!password.matches(".*[A-Z].*")) {
            return "Password must contain at least one uppercase letter";
        }

        if (!password.matches(".*[a-z].*")) {
            return "Password must contain at least one lowercase letter";
        }

        if (!password.matches(".*\\d.*")) {
            return "Password must contain at least one number";
        }

        if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            return "Password must contain at least one special character";
        }

        return null;
    }


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        String password = body.get("password");
        String firstName = body.get("firstName");
        String lastName = body.get("lastName");

        if (!otpService.validateOTP(email, otp)) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Invalid or expired OTP")
            );
        }

        try {
            User user = userService.createUser(firstName, lastName, email, password);
            emailService.sendWelcomeEmail(user);
            otpService.clearOTP(email);

            return ResponseEntity.ok(
                    Map.of("success", true, "message", "Registration successful")
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("success", false, "message", "Registration failed")
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(
            @RequestBody Map<String, String> body,
            HttpSession session
    ) {
        String email = body.get("email");
        String password = body.get("password");

          
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Email is required")
            );
        }

        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Password is required")
            );
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

          
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(
                    Map.of("success", false, "message", "Account not found with this email")
            );
        }

          
        if (!passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body(
                    Map.of("success", false, "message", "Incorrect password")
            );
        }

        session.setAttribute("userId", userOpt.get().getId());
        return ResponseEntity.ok(
                Map.of("success", true, "message", "Login successful")
        );
    }

    @GetMapping("/check-session")
    public ResponseEntity<?> checkSession(HttpSession session) {
        Object userId = session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(
                    Map.of("success", false, "message", "Not authenticated")
            );
        }
          
        Optional<User> userOpt = userRepository.findById((Long) userId);   
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return ResponseEntity.ok(
                    Map.of("success", true, "userId", userId, "email", user.getEmail(), "firstName", user.getFirstName(), "lastName", user.getLastName())
            );
        } else {
              
            session.invalidate();   
            return ResponseEntity.status(401).body(
                    Map.of("success", false, "message", "User not found for session")
            );
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(
                Map.of("success", true, "message", "Logout successful")
        );
    }
}
