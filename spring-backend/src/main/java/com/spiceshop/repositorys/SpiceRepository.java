package com.spiceshop.repositorys;

import com.spiceshop.models.Spice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpiceRepository extends JpaRepository<Spice, Long> {
}
