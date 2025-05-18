// com.spiceshop.dto.SpiceDto.java
package com.spiceshop.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SpiceDto {
    private Long id;
    private String name;
    private String unit;
    private String description;
    private String origin;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> imageUrls;
    private List<VariantDto> variants;
}