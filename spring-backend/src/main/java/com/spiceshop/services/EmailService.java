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

    @Value("${FRONTEND_URL}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final String LOGO_URL = "https://i.imgur.com/7sup17XF.png";
    private static final String SUPPORT_EMAIL = "support@aroglinspicefarms.com";
    private static final String SOCIAL_MEDIA = """
        <div style="text-align: center; margin: 20px 0;">
            <a href="https://facebook.com/aroglinspicefarms" style="margin: 0 10px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" width="24" alt="Facebook">
            </a>
            <a href="https://instagram.com/aroglinspicefarms" style="margin: 0 10px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" alt="Instagram">
            </a>
            <a href="https://twitter.com/aroglinspice" style="margin: 0 10px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="24" alt="Twitter">
            </a>
        </div>
        """;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private String createEmailTemplate(String content) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
                        line-height: 1.6; 
                        color: #2d3748; 
                        margin: 0; 
                        padding: 0; 
                        background-color: #f7fafc; 
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 20px auto; 
                        padding: 40px; 
                        border-radius: 12px; 
                        background: white; 
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
                    }
                    .header { 
                        text-align: center; 
                        padding-bottom: 30px; 
                        border-bottom: 2px solid #e2e8f0;
                    }
                    .logo { 
                        max-width: 220px; 
                        height: auto; 
                        margin-bottom: 25px;
                    }
                    .content { 
                        padding: 35px 0; 
                        color: #4a5568;
                    }
                    .footer { 
                        text-align: center; 
                        padding-top: 30px; 
                        font-size: 0.875em; 
                        color: #718096; 
                        border-top: 1px solid #e2e8f0;
                    }
                    .otp-code { 
                        font-size: 32px; 
                        color: #c05621; 
                        font-weight: 700; 
                        letter-spacing: 3px; 
                        margin: 25px 0;
                        text-align: center;
                    }
                    .button {
                        display: inline-block;
                        padding: 14px 28px;
                        background: #c05621;
                        color: white !important;
                        text-decoration: none;
                        border-radius: 8px;
                        margin: 20px 0;
                        font-weight: 600;
                        transition: all 0.2s ease;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .button:hover {
                        background: #9c4621;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .features {
                        margin: 25px 0;
                        padding: 20px;
                        background: #fff5f5;
                        border-radius: 8px;
                    }
                    .features li {
                        margin: 10px 0;
                        padding-left: 25px;
                        position: relative;
                    }
                    .features li:before {
                        content: "✓";
                        color: #48bb78;
                        position: absolute;
                        left: 0;
                    }
                    @media (max-width: 640px) {
                        .container {
                            margin: 10px;
                            padding: 25px;
                        }
                        .otp-code {
                            font-size: 28px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="%s" class="logo" alt="Aroglin Spice Farms">
                        <h1 style="color: #2d3748; margin: 0; font-size: 24px;">Premium Organic Spices</h1>
                    </div>
                    <div class="content">
                        %s
                    </div>
                    %s
                    <div class="footer">
                        <p>Need assistance? Contact our support team at<br>
                        <a href="mailto:%s" style="color: #c05621; text-decoration: none;">%s</a></p>
                        <p style="margin: 15px 0;">Follow us on social media:</p>
                        %s
                        <p style="margin-top: 20px; font-size: 0.9em; color: #a0aec0;">
                            &copy; 2024 Aroglin Spice Farms. All rights reserved.<br>
                            <a href="#privacy" style="color: #718096; text-decoration: none;">Privacy Policy</a> | 
                            <a href="#terms" style="color: #718096; text-decoration: none;">Terms of Service</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, LOGO_URL, content, SOCIAL_MEDIA, SUPPORT_EMAIL, SUPPORT_EMAIL, SOCIAL_MEDIA);
    }

    public void sendRegistrationOTP(String email, String otp) {
        String content = String.format("""
        <h2 style="color: #2d3748; margin-top: 0;">Almost There, Spice Enthusiast! 🔥</h2>
        <p>Welcome to Aroglin Spice Farms! To complete your registration, please use the following One-Time Password:</p>
        <div class="otp-code">%s</div>
        <div class="features">
            <p style="margin: 0;"><strong>Why choose us?</strong></p>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li>100% Organic Certified Spices</li>
                <li>Directly Sourced from Farmers</li>
                <li>Fast Pan-India Delivery</li>
            </ul>
        </div>
        <p style="color: #718096; font-size: 0.9em;">This OTP is valid for 5 minutes. If you didn't request this, please ignore this email.</p>
        """, otp);

        sendEmail(email, "Your Secret Spice Code 🧂 - Aroglin Spice Farms", content);
    }

    public void sendWelcomeEmail(User user) {
        String profileUrl = frontendUrl + "/my-profile";
        String content = String.format("""
        <h2 style="color: #2d3748; margin-top: 0;">Welcome to the Spice Family, %s! 🌿</h2>
        <p>Your account has been successfully created! Now you can:</p>
        <div class="features">
            <ul>
                <li>Track your orders in real-time</li>
                <li>Save multiple delivery addresses</li>
                <li>Get exclusive member discounts</li>
                <li>Access premium recipes</li>
            </ul>
        </div>
        <p><strong>Registered Email:</strong><br>%s</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="%s" class="button">Start Your Spice Journey →</a>
        </p>
        <p style="color: #718096;">Need help? Reply to this email or visit our <a href="%s/help" style="color: #c05621;">support center</a>.</p>
        """, user.getFirstName(), user.getEmail(), profileUrl, frontendUrl);

        sendEmail(user.getEmail(), "Welcome to the Spice Family! 🎉 - Aroglin Spice Farms", content);
    }


    private void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom("Aroglin Spice Farms <" + fromEmail + ">");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(createEmailTemplate(content), true);

            mailSender.send(mimeMessage);
            System.out.println("Email sent successfully to: " + to);
        } catch (MailException | MessagingException e) {
            System.err.println("Error sending email to " + to + ": ");
            e.printStackTrace();
        }
    }
}