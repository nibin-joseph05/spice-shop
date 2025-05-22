package com.spiceshop.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpiceVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String qualityClass; // e.g., "Class 1", "Class 2"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spice_id")
    private Spice spice;

    // Multiple pack sizes per quality class
    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SpicePack> packs = new ArrayList<>();


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQualityClass() {
        return qualityClass;
    }

    public void setQualityClass(String qualityClass) {
        this.qualityClass = qualityClass;
    }

    public Spice getSpice() {
        return spice;
    }

    public void setSpice(Spice spice) {
        this.spice = spice;
    }

    public List<SpicePack> getPacks() {
        return packs;
    }

    public void setPacks(List<SpicePack> packs) {
        this.packs = packs;
    }
}
