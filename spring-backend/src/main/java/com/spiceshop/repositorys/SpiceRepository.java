package com.spiceshop.repositorys;

import com.spiceshop.models.Spice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SpiceRepository extends JpaRepository<Spice, Long>, JpaSpecificationExecutor<Spice> {

}
