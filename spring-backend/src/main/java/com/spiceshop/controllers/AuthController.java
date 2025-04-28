package com.spiceshop.controllers;

import com.spiceshop.services.OTPService;
import com.spiceshop.services.UserService;
import com.spiceshop.services.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.spiceshop.models.User;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${FRONTEND_URL}")
public class AuthController {

    private final UserService userService;
    private final OTPService otpService;
    private final EmailService emailService;

    public AuthController(UserService userService,
                          OTPService otpService,
                          EmailService emailService) {
        this.userService = userService;
        this.otpService = otpService;
        this.emailService = emailService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOTP(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        if (userService.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Email already registered")
            );
        }

        String otp = otpService.generateOTP(email);
        emailService.sendRegistrationOTP(email, otp);
        return ResponseEntity.ok().body(
                Map.of("success", true, "message", "OTP sent successfully")
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        // Validate OTP
        if (!otpService.validateOTP(email, otp)) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Invalid or expired OTP")
            );
        }

        return ResponseEntity.ok().body(
                Map.of("success", true, "message", "OTP verified successfully")
        );
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
            otpService.clearOTP(email);  // Clear OTP after successful registration

            return ResponseEntity.ok().body(
                    Map.of("success", true, "message", "Registration successful")
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("success", false, "message", "Registration failed")
            );
        }
    }
}
