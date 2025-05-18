// com.spiceshop.services.SpiceService.java
package com.spiceshop.services;

import com.spiceshop.dto.*;
import com.spiceshop.models.*;
import com.spiceshop.repositorys.SpiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;

@Service
public class SpiceService {

    @Autowired
    private SpiceRepository spiceRepository;

    @Transactional
    public Spice createSpice(Spice spice) {
        spice.getVariants().forEach(v -> v.setSpice(spice));
        spice.getImages().forEach(i -> i.setSpice(spice));
        return spiceRepository.save(spice);
    }

    public SpiceDto toDto(Spice s) {
        SpiceDto dto = new SpiceDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setUnit(s.getUnit());
        dto.setDescription(s.getDescription());
        dto.setOrigin(s.getOrigin());
        dto.setIsAvailable(s.getAvailable());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());
        dto.setImageUrls(
                s.getImages().stream()
                        .map(SpiceImage::getImageUrl)
                        .collect(Collectors.toList())
        );
        dto.setVariants(
                s.getVariants().stream()
                        .map(v -> new VariantDto(v.getId(), v.getQualityClass(), v.getPrice()))
                        .collect(Collectors.toList())
        );
        return dto;
    }
}
