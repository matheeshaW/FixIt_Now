package com.fixitnow.backend.service;

import com.fixitnow.backend.model.Booking;
import com.fixitnow.backend.model.Review;
import com.fixitnow.backend.model.User;
import com.fixitnow.backend.repository.BookingRepository;
import com.fixitnow.backend.repository.ReviewRepository;
import com.fixitnow.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Transactional
    public Review addReview(Long bookingId, Long customerId, Long providerId, int rating, String comment) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Review can only be added when booking is completed");
        }
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));
        Review review = Review.builder()
                .booking(booking)
                .customer(customer)
                .provider(provider)
                .rating(rating)
                .comment(comment)
                .build();
        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByProvider(Long providerId) {
        return reviewRepository.findByProviderUserIdOrderByCreatedAtDesc(providerId);
    }

    public List<Review> getReviewsByCustomer(Long customerId) {
        return reviewRepository.findByCustomerUserIdOrderByCreatedAtDesc(customerId);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }
}

