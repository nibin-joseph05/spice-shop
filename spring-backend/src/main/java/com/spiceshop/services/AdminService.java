package com.spiceshop.services;

import com.spiceshop.models.Admin;
import com.spiceshop.repositorys.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Method to create an admin
    public Admin createAdmin(Admin admin) {
        // Hash the password before saving it
        String hashedPassword = passwordEncoder.encode(admin.getPassword());
        admin.setPassword(hashedPassword);

        // Generate secret key if not already generated
        if (admin.getSecretKey() == null || admin.getSecretKey().isEmpty()) {
            admin.setSecretKey(generateSecretKey());
        }

        return adminRepository.save(admin);
    }

    // Method to generate a secure random secret key
    private String generateSecretKey() {
        return new String(java.util.Base64.getEncoder().encode(java.util.UUID.randomUUID().toString().getBytes()));
    }

    // Method to verify admin login using email and password
    public boolean verifyLogin(String email, String password) {
        Admin admin = adminRepository.findByEmail(email);
        if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
            return true;
        }
        return false;
    }

    // Method to recover the admin using secret key
    public Admin recoverAdmin(String secretKey) {
        return adminRepository.findBySecretKey(secretKey);
    }
}
