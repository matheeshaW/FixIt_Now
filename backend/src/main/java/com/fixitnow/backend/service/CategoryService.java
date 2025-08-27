package com.fixitnow.backend.service;

import com.fixitnow.backend.model.ServiceCategory;
import com.fixitnow.backend.repository.ServiceCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final ServiceCategoryRepository categoryRepository;

    public CategoryService(ServiceCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<ServiceCategory> findAll() {
        return categoryRepository.findAll();
    }

    public ServiceCategory create(ServiceCategory category) {
        return categoryRepository.save(category);
    }

    public ServiceCategory update(Long id, ServiceCategory updated) {
        ServiceCategory existing = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        existing.setCategoryName(updated.getCategoryName());
        existing.setDescription(updated.getDescription());
        return categoryRepository.save(existing);
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }
}


