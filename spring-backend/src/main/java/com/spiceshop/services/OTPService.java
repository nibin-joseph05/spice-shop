package com.spiceshop.services;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OTPService {

    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    private final Map<String, Long> otpExpiry = new ConcurrentHashMap<>();
    private static final long OTP_VALID_DURATION = 5 * 60 * 1000; // 5 minutes
    private final Map<String, Integer> otpAttempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final int BLOCK_TIME_MINUTES = 15;

    public boolean isOTPRequestBlocked(String email) {
        String key = "OTP_REQ_" + email;
        Integer attempts = otpAttempts.getOrDefault(key, 0);
        return attempts >= MAX_ATTEMPTS;
    }

    public String generateOTP(String email) {
        otpAttempts.remove("OTP_REQ_" + email);

        // OTP generation logic
        String otp = String.format("%06d", new Random().nextInt(1000000));

        // Store the OTP and attempt count
        otpStorage.put(email, otp);
        otpExpiry.put(email, System.currentTimeMillis() + OTP_VALID_DURATION);
        String key = "OTP_REQ_" + email;
        otpAttempts.put(key, otpAttempts.getOrDefault(key, 0) + 1);

        // Schedule cleanup for blocked OTP requests after BLOCK_TIME_MINUTES
        new Timer().schedule(new TimerTask() {
            @Override
            public void run() {
                otpAttempts.remove(key);
            }
        }, BLOCK_TIME_MINUTES * 60 * 1000);

        return otp;
    }

    public boolean validateOTP(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        Long expiryTime = otpExpiry.get(email);

        if (storedOtp == null || expiryTime == null) {
            return false;
        }

        // Check if the OTP has expired
        if (System.currentTimeMillis() > expiryTime) {
            clearOTP(email);
            return false;
        }

        return storedOtp.equals(otp);
    }

    public void clearOTP(String email) {
        otpStorage.remove(email);
        otpExpiry.remove(email);
    }
}
