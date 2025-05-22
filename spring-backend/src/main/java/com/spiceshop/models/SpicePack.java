package com.spiceshop.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpicePack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer packWeightInGrams;

    private BigDecimal price;

    private Integer stockQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private SpiceVariant variant;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getPackWeightInGrams() {
        return packWeightInGrams;
    }

    public void setPackWeightInGrams(Integer packWeightInGrams) {
        this.packWeightInGrams = packWeightInGrams;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public SpiceVariant getVariant() {
        return variant;
    }

    public void setVariant(SpiceVariant variant) {
        this.variant = variant;
    }
}
