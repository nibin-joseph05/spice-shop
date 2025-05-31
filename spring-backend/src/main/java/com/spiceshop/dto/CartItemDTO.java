// CartItemDTO.java
package com.spiceshop.dto;

import java.math.BigDecimal;

public class CartItemDTO {
    private Long id;
    private Long spicePackId;
    private String spiceName;
    private String qualityClass;
    private int packWeightInGrams;
    private BigDecimal price;
    private int quantity;
    private BigDecimal totalPrice;
    private String imageUrl;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSpicePackId() { return spicePackId; }
    public void setSpicePackId(Long spicePackId) { this.spicePackId = spicePackId; }
    public String getSpiceName() { return spiceName; }
    public void setSpiceName(String spiceName) { this.spiceName = spiceName; }
    public String getQualityClass() { return qualityClass; }
    public void setQualityClass(String qualityClass) { this.qualityClass = qualityClass; }
    public int getPackWeightInGrams() { return packWeightInGrams; }
    public void setPackWeightInGrams(int packWeightInGrams) { this.packWeightInGrams = packWeightInGrams; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}