package com.spiceshop.repositorys;

import com.spiceshop.models.Spice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SpiceRepository extends JpaRepository<Spice, Long>, JpaSpecificationExecutor<Spice> {

    @Query("SELECT s FROM Spice s WHERE LOWER(TRIM(s.name)) = LOWER(TRIM(:name))")
    Optional<Spice> findByNormalizedName(@Param("name") String name);

    @Query("SELECT LOWER(TRIM(v.qualityClass)) FROM SpiceVariant v GROUP BY LOWER(TRIM(v.qualityClass))")
    List<String> findDistinctQualityClasses();

    @Query("SELECT s FROM Spice s WHERE s.origin = :origin AND s.id != :id AND s.isAvailable = true")
    List<Spice> findRelatedByOrigin(@Param("id") Long id, @Param("origin") String origin);


}
