// AddToCartRequest.java
package com.spiceshop.dto;

public class AddToCartRequest {
    private Long spicePackId;
    private int quantity;

    // Getters and Setters
    public Long getSpicePackId() { return spicePackId; }
    public void setSpicePackId(Long spicePackId) { this.spicePackId = spicePackId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}