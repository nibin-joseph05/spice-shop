package com.spiceshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PackDto {
    private Long id;
    private Integer packWeightInGrams;
    private BigDecimal price;
    private Integer stockQuantity;
}