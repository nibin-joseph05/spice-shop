package com.spiceshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackRequest {
    private Integer packWeightInGrams;
    private BigDecimal price;
    private Integer stockQuantity;
}
