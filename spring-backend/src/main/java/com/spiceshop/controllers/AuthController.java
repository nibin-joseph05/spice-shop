package com.spiceshop.controllers;

import com.spiceshop.services.OTPService;
import com.spiceshop.services.UserService;
import com.spiceshop.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final OTPService otpService;
    private final EmailService emailService;

    @Value("${FRONTEND_URL}")
    private String frontendUrl;

    @Autowired
    public AuthController(UserService userService, OTPService otpService, EmailService emailService) {
        this.userService = userService;
        this.otpService = otpService;
        this.emailService = emailService;
    }

    @CrossOrigin(origins = "${FRONTEND_URL}")
    @PostMapping("/send-otp")
    public String sendOTP(@RequestParam String email) {
        if (userService.existsByEmail(email)) {
            return "Email already in use";
        }
        String otp = otpService.generateOTP(email);
        emailService.sendRegistrationOTP(email, otp);
        return "OTP sent to " + email;
    }

    @CrossOrigin(origins = "${FRONTEND_URL}")
    @PostMapping("/register")
    public String registerUser(@RequestParam String email,
                               @RequestParam String otp,
                               @RequestParam String password,
                               @RequestParam String firstName,
                               @RequestParam String lastName) {
        if (!otpService.validateOTP(email, otp)) {
            return "Invalid or expired OTP";
        }

        userService.createUser(firstName, lastName, email, password);
        otpService.clearOTP(email);
        return "User registered successfully";
    }
}
