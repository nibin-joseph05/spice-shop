// CartDTO.java
package com.spiceshop.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartDTO {
    private Long id;
    private List<CartItemDTO> items;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal total;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public List<CartItemDTO> getItems() { return items; }
    public void setItems(List<CartItemDTO> items) { this.items = items; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getShippingCost() { return shippingCost; }
    public void setShippingCost(BigDecimal shippingCost) { this.shippingCost = shippingCost; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
}