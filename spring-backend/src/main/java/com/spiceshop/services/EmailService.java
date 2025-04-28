package com.spiceshop.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import com.spiceshop.models.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendRegistrationOTP(String email, String otp) {
        String message = String.format("""
            Your OTP for registration is: %s
            This OTP is valid for 5 minutes.
            """, otp);

        System.out.println("Sending OTP email to " + email);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Your OTP for Registration");
            helper.setText(message);

            mailSender.send(mimeMessage);
            System.out.println("OTP email sent successfully!");
        } catch (MailException | MessagingException e) {
            System.out.println("Error sending OTP email: " + e.getMessage());
        }
    }

    public void sendWelcomeEmail(User user) {
        String message = String.format("""
            Welcome %s %s!
            
            Your account has been successfully created.
            Username: %s
            """, user.getFirstName(), user.getLastName(), user.getEmail());

        System.out.println("Sending welcome email to " + user.getEmail());

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Welcome to KSR Farms");
            helper.setText(message);

            mailSender.send(mimeMessage);
            System.out.println("Welcome email sent successfully!");
        } catch (MailException | MessagingException e) {
            System.out.println("Error sending welcome email: " + e.getMessage());
        }
    }
}
