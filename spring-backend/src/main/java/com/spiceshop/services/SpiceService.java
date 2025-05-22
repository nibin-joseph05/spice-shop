// com.spiceshop.services.SpiceService.java
package com.spiceshop.services;

import com.spiceshop.exceptions.DuplicateSpiceNameException;
import com.spiceshop.dto.*;
import com.spiceshop.models.*;
import com.spiceshop.repositorys.SpiceRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SpiceService {

    @Autowired
    private SpiceRepository spiceRepository;

    @Transactional
    public Spice createSpice(Spice spice) {

        String normalizedName = spice.getName().trim().toLowerCase();

        spiceRepository.findByNormalizedName(normalizedName)
                .ifPresent(existing -> {
                    throw new DuplicateSpiceNameException("Spice with name '" + spice.getName() + "' already exists", existing.getId());
                });


        if (spice.getVariants() != null) {
            spice.getVariants().forEach(v -> {
                v.setSpice(spice); // Link variant to spice
                if (v.getPacks() != null) {
                    v.getPacks().forEach(p -> p.setVariant(v)); // Crucial: Link pack to variant
                }
            });
        }

        if (spice.getImages() != null) {
            spice.getImages().forEach(i -> i.setSpice(spice)); // Link image to spice
        }
        return spiceRepository.save(spice);
    }

    public List<Spice> getAllSpices() {
        return spiceRepository.findAll();
    }

    @Transactional
    public void deleteSpice(Long id) {
        Spice spice = spiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spice not found"));

        // Cascade delete will handle variants and images if properly configured
        spiceRepository.delete(spice);
    }

    @Transactional
    public Spice updateAvailability(Long id, Boolean available) {
        Spice spice = spiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spice not found"));
        spice.setAvailable(available);
        return spiceRepository.save(spice);
    }

    public SpiceDto toDto(Spice s) {
        SpiceDto dto = new SpiceDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
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
                        .map(v -> new VariantDto(
                                v.getId(),
                                v.getQualityClass(),
                                v.getPacks().stream()
                                        .map(p -> new PackDto(
                                                p.getId(),
                                                p.getPackWeightInGrams(),
                                                p.getPrice(),
                                                p.getStockQuantity()
                                        ))
                                        .collect(Collectors.toList())
                        ))
                        .collect(Collectors.toList())
        );
        return dto;
    }


    public Page<Spice> getFilteredSpices(
            int page, int limit, String search,
            BigDecimal minPrice, BigDecimal maxPrice,
            List<String> origins, List<String> qualityClasses,
            Boolean inStock) {

        Specification<Spice> spec = buildSpecification(
                search, minPrice, maxPrice, origins, qualityClasses, inStock
        );

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("name"));
        return spiceRepository.findAll(spec, pageable);
    }

    private Specification<Spice> buildSpecification(
            String search, BigDecimal minPrice, BigDecimal maxPrice,
            List<String> origins, List<String> qualityClasses, Boolean inStock) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%")
                ));
            }

            if (origins != null && !origins.isEmpty()) {
                predicates.add(root.get("origin").in(origins));
            }

            if (inStock != null) {
                predicates.add(cb.equal(root.get("isAvailable"), inStock));
            }

            if (qualityClasses != null && !qualityClasses.isEmpty()) {
                Join<Spice, SpiceVariant> variantJoin = root.join("variants");
                predicates.add(variantJoin.get("qualityClass").in(qualityClasses));
            }

            if (minPrice != null || maxPrice != null) {
                Join<Spice, SpiceVariant> variantJoin = root.join("variants");
                Join<SpiceVariant, SpicePack> packJoin = variantJoin.join("packs");
                if (minPrice != null) {
                    predicates.add(cb.ge(packJoin.get("price"), minPrice));
                }
                if (maxPrice != null) {
                    predicates.add(cb.le(packJoin.get("price"), maxPrice));
                }
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public Spice getSpiceById(Long id) {
        return spiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spice not found"));
    }

}
