package com.spiceshop.repositorys;

import com.spiceshop.models.SpiceVariant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpiceVariantRepository extends JpaRepository<SpiceVariant, Long> {
}
