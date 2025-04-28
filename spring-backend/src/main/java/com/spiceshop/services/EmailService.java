// EmailService.java
package com.spiceshop.services;

import com.spiceshop.models.User;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendRegistrationOTP(String email, String otp) {
        // Implement actual email sending logic
        String message = String.format("""
            Your OTP for registration is: %s
            This OTP is valid for 5 minutes.
            """, otp);

        System.out.println("Sending OTP email to " + email);
        System.out.println(message);
    }

    public void sendWelcomeEmail(User user) {
        String message = String.format("""
            Welcome %s %s!
            
            Your account has been successfully created.
            Username: %s
            """, user.getFirstName(), user.getLastName(), user.getEmail());

        System.out.println("Sending welcome email to " + user.getEmail());
        System.out.println(message);
    }
}