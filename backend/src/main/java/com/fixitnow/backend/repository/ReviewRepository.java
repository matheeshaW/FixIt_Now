package com.fixitnow.backend.repository;

import com.fixitnow.backend.model.Review;
import com.fixitnow.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProviderUserIdOrderByCreatedAtDesc(Long providerId);
    List<Review> findByCustomerUserIdOrderByCreatedAtDesc(Long customerId);
}

