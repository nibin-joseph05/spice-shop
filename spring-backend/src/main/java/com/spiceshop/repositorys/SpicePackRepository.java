package com.spiceshop.repositorys;

import com.spiceshop.models.SpicePack;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpicePackRepository extends JpaRepository<SpicePack, Long> {
}