package com.spiceshop.models;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Spice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String unit;
    private String description;

    @OneToMany(mappedBy = "spice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SpiceImage> images = new ArrayList<>();

    private String origin;

    private Boolean isAvailable = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "spice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SpiceVariant> variants = new ArrayList<>();


}

