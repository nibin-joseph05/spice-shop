// com.spiceshop.dto.SpiceRequest.java
package com.spiceshop.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpiceRequest {
    private String name;
    private String unit;
    private String description;
    private String origin;
    private Boolean isAvailable;
    private List<String> imageUrls;
    private List<VariantRequest> variants;
    private List<String> images;
}


