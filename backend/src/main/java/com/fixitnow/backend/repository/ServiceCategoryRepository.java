package com.fixitnow.backend.repository;

import com.fixitnow.backend.model.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    boolean existsByCategoryName(String categoryName);
}


