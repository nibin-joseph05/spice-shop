package com.spiceshop.models;

import jakarta.persistence.*;
import lombok.*;
import java.security.SecureRandom;
import java.util.Base64;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    @Column(nullable = false, unique = true)
    private String secretKey;

    @PrePersist
    private void generateSecretKey() {
        this.secretKey = generateSecureSecretKey();
    }


    private String generateSecureSecretKey() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] randomBytes = new byte[24];
        secureRandom.nextBytes(randomBytes);
        return Base64.getEncoder().encodeToString(randomBytes);
    }
}
