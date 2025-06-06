package com.spiceshop.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Snapshot of product details at time of purchase
    @NotBlank
    private String spiceName;

    @NotBlank
    private String qualityClass;

    @NotNull
    private Integer packWeightInGrams;

    @NotNull
    private BigDecimal unitPrice;

    @NotNull
    private Integer quantity;

    // Reference to original product (if still available)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spice_pack_id")
    private SpicePack spicePack;

    public BigDecimal getTotalPrice() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}