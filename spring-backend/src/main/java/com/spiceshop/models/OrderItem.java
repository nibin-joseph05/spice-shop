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
    private String qualityClass; // Directly store the string quality class from SpiceVariant

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

    // Getters and Setters (Lombok @Data annotation handles this, but explicitly shown for clarity if needed)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public String getSpiceName() {
        return spiceName;
    }

    public void setSpiceName(String spiceName) {
        this.spiceName = spiceName;
    }

    public String getQualityClass() {
        return qualityClass;
    }

    public void setQualityClass(String qualityClass) {
        this.qualityClass = qualityClass;
    }

    public Integer getPackWeightInGrams() {
        return packWeightInGrams;
    }

    public void setPackWeightInGrams(Integer packWeightInGrams) {
        this.packWeightInGrams = packWeightInGrams;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public SpicePack getSpicePack() {
        return spicePack;
    }

    public void setSpicePack(SpicePack spicePack) {
        this.spicePack = spicePack;
    }
}