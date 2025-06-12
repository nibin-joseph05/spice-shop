package com.spiceshop.services;

import com.spiceshop.models.Admin;
import com.spiceshop.repositorys.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


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

    public Admin getAnyAdminProfile() {

        List<Admin> admins = adminRepository.findAll();
        if (!admins.isEmpty()) {
            return admins.get(0);
        }
        return null;
    }


    public Admin recoverAdmin(String secretKey) {
        return adminRepository.findBySecretKey(secretKey);
    }

    public Admin findByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public boolean changePassword(String email, String currentPassword, String newPassword) {
        Admin admin = adminRepository.findByEmail(email);
        if (admin == null) {
            return false; // Admin not found
        }

        // Verify the current password
        if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
            return false; // Current password does not match
        }

        // Hash and set the new password
        String hashedPassword = passwordEncoder.encode(newPassword);
        admin.setPassword(hashedPassword);
        adminRepository.save(admin); // Save the updated admin
        return true;
    }

    public Admin updateAdminProfile(Long id, Admin updatedAdmin) {
        Optional<Admin> existingAdminOptional = adminRepository.findById(id);
        if (existingAdminOptional.isPresent()) {
            Admin adminToUpdate = existingAdminOptional.get();

            // Only update allowed fields
            if (updatedAdmin.getName() != null && !updatedAdmin.getName().isEmpty()) {
                adminToUpdate.setName(updatedAdmin.getName());
            }
            if (updatedAdmin.getEmail() != null && !updatedAdmin.getEmail().isEmpty()) {
                // You might want to add logic here to prevent changing email to an already existing one
                adminToUpdate.setEmail(updatedAdmin.getEmail());
            }
            // Phone can be null or empty, allow it to be updated or cleared
            adminToUpdate.setPhone(updatedAdmin.getPhone());

            return adminRepository.save(adminToUpdate);
        }
        return null;
    }

    public boolean adminEmailExists(String email) {
        return adminRepository.findByEmail(email) != null;
    }

    public boolean resetPasswordWithEmailAndSecretKey(String email, String secretKey, String newPassword) {
        Admin admin = adminRepository.findByEmail(email);
        if (admin == null) {
            return false; // Admin not found for this email
        }

        if (!admin.getSecretKey().equals(secretKey)) {
            return false; // Secret key does not match for this admin
        }

        String hashedPassword = passwordEncoder.encode(newPassword);
        admin.setPassword(hashedPassword);
        adminRepository.save(admin);
        return true;
    }

    public boolean verifySecretKeyForEmail(String email, String secretKey) {
        Admin admin = adminRepository.findByEmail(email);
        return admin != null && admin.getSecretKey().equals(secretKey);
    }


}
