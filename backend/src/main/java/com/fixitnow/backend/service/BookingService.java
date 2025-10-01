package com.fixitnow.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

import com.fixitnow.backend.controller.dto.BookingDtos.BookingResponse;
import com.fixitnow.backend.controller.dto.BookingDtos.BookingStatsResponse;
import com.fixitnow.backend.controller.dto.BookingDtos.BookingSummaryResponse;
import com.fixitnow.backend.controller.dto.BookingDtos.CreateBookingRequest;
import com.fixitnow.backend.controller.dto.BookingDtos.UpdateBookingRequest;
import com.fixitnow.backend.controller.dto.BookingDtos.UpdateBookingStatusRequest;
import com.fixitnow.backend.model.Booking;
import com.fixitnow.backend.model.Role;
import com.fixitnow.backend.model.Service;
import com.fixitnow.backend.model.User;
import com.fixitnow.backend.repository.BookingRepository;
import com.fixitnow.backend.repository.ServiceRepository;
import com.fixitnow.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    /**
     * Create a new booking
     */
    public BookingResponse createBooking(CreateBookingRequest request, String customerEmail) {
        // Find customer
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        // Check if user is a customer
        if (customer.getRole() != Role.CUSTOMER) {
            throw new IllegalArgumentException("Only customers can create bookings. Please log in as a customer.");
        }

        // Find service
        Service service = serviceRepository.findById(request.serviceId())
                .orElseThrow(() -> new IllegalArgumentException("Service not found"));

        // Validate service is available
        if (service.getAvailabilityStatus() != Service.AvailabilityStatus.AVAILABLE) {
            throw new IllegalArgumentException("Service is not available for booking");
        }

        // Check for conflicting bookings
        if (bookingRepository.existsConflictingBooking(service, request.bookingDate())) {
            throw new IllegalArgumentException("Time slot is already booked");
        }

        // Create booking
        Booking booking = Booking.builder()
                .customer(customer)
                .service(service)
                .bookingDate(request.bookingDate())
                .specialRequests(request.specialRequests())
                .customerAddress(request.customerAddress())
                .customerPhone(request.customerPhone())
                .totalAmount(service.getPrice())
                .status(Booking.BookingStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return new BookingResponse(savedBooking);
    }

    /**
     * Get booking by ID with security check
     */
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Security check: user must be either customer or provider
        if (!booking.getCustomer().equals(user) && !booking.getService().getProvider().equals(user)) {
            throw new IllegalArgumentException("Access denied");
        }

        return new BookingResponse(booking);
    }

    /**
     * Get all bookings for a customer
     */
    @Transactional(readOnly = true)
    public List<BookingSummaryResponse> getCustomerBookings(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        return bookingRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(BookingSummaryResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get all bookings for a provider
     */
    @Transactional(readOnly = true)
    public List<BookingSummaryResponse> getProviderBookings(String providerEmail) {
        User provider = userRepository.findByEmail(providerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found"));

        return bookingRepository.findByServiceProviderOrderByCreatedAtDesc(provider)
                .stream()
                .map(BookingSummaryResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get bookings by status for a customer
     */
    @Transactional(readOnly = true)
    public List<BookingSummaryResponse> getCustomerBookingsByStatus(String customerEmail, Booking.BookingStatus status) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        return bookingRepository.findByCustomerAndStatusOrderByCreatedAtDesc(customer, status)
                .stream()
                .map(BookingSummaryResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get bookings by status for a provider
     */
    @Transactional(readOnly = true)
    public List<BookingSummaryResponse> getProviderBookingsByStatus(String providerEmail, Booking.BookingStatus status) {
        User provider = userRepository.findByEmail(providerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found"));

        return bookingRepository.findByServiceProviderAndStatusOrderByCreatedAtDesc(provider, status)
                .stream()
                .map(BookingSummaryResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Update booking status (Provider only)
     */
    public BookingResponse updateBookingStatus(Long bookingId, UpdateBookingStatusRequest request, String providerEmail) {
        User provider = userRepository.findByEmail(providerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found"));

        Booking booking = bookingRepository.findByBookingIdAndServiceProvider(bookingId, provider)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found or access denied"));

        // Validate status transition
        if (!isValidStatusTransition(booking.getStatus(), request.status())) {
            throw new IllegalArgumentException("Invalid status transition from " + booking.getStatus() + " to " + request.status());
        }

        booking.setStatus(request.status());
        Booking updatedBooking = bookingRepository.save(booking);

        return new BookingResponse(updatedBooking);
    }

    /**
     * Update booking details (Customer only, limited fields)
     */
    public BookingResponse updateBooking(Long bookingId, UpdateBookingRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        Booking booking = bookingRepository.findByBookingIdAndCustomer(bookingId, customer)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found or access denied"));

        // Only allow updates for PENDING bookings
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalArgumentException("Can only update pending bookings");
        }

        // Update fields if provided
        if (request.bookingDate() != null) {
            // Check for conflicts with new date
            if (bookingRepository.existsConflictingBooking(booking.getService(), request.bookingDate())) {
                throw new IllegalArgumentException("Time slot is already booked");
            }
            booking.setBookingDate(request.bookingDate());
        }

        if (request.specialRequests() != null) {
            booking.setSpecialRequests(request.specialRequests());
        }

        if (request.customerAddress() != null) {
            booking.setCustomerAddress(request.customerAddress());
        }

        if (request.customerPhone() != null) {
            booking.setCustomerPhone(request.customerPhone());
        }

        Booking updatedBooking = bookingRepository.save(booking);
        return new BookingResponse(updatedBooking);
    }

    /**
     * Cancel booking (Customer only)
     */
    public BookingResponse cancelBooking(Long bookingId, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        Booking booking = bookingRepository.findByBookingIdAndCustomer(bookingId, customer)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found or access denied"));

        // Only allow cancellation of PENDING or CONFIRMED bookings
        if (booking.getStatus() != Booking.BookingStatus.PENDING && 
            booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("Can only cancel pending or confirmed bookings");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking updatedBooking = bookingRepository.save(booking);

        return new BookingResponse(updatedBooking);
    }

    /**
     * Get upcoming bookings for a customer
     */
    @Transactional(readOnly = true)
    public List<BookingSummaryResponse> getUpcomingCustomerBookings(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        return bookingRepository.findUpcomingBookingsForCustomer(customer, LocalDateTime.now())
                .stream()
                .map(BookingSummaryResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get upcoming bookings for a provider
     */
    @Transactional(readOnly = true)
    public List<BookingSummaryResponse> getUpcomingProviderBookings(String providerEmail) {
        User provider = userRepository.findByEmail(providerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found"));

        return bookingRepository.findUpcomingBookingsForProvider(provider, LocalDateTime.now())
                .stream()
                .map(BookingSummaryResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get booking statistics for a provider
     */
    @Transactional(readOnly = true)
    public BookingStatsResponse getProviderBookingStats(String providerEmail) {
        User provider = userRepository.findByEmail(providerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found"));

        Long totalBookings = bookingRepository.countByServiceProviderAndStatus(provider, Booking.BookingStatus.PENDING) +
                           bookingRepository.countByServiceProviderAndStatus(provider, Booking.BookingStatus.CONFIRMED) +
                           bookingRepository.countByServiceProviderAndStatus(provider, Booking.BookingStatus.IN_PROGRESS) +
                           bookingRepository.countByServiceProviderAndStatus(provider, Booking.BookingStatus.COMPLETED) +
                           bookingRepository.countByServiceProviderAndStatus(provider, Booking.BookingStatus.CANCELLED);

        Long pendingBookings = bookingRepository.countByServiceProviderAndStatus(provider, Booking.BookingStatus.PENDING);
        Long confirmedBookings = bookingRepository.countByServiceProviderAndStatus(provider, Booking.BookingStatus.CONFIRMED);
        Long completedBookings = bookingRepository.countByServiceProviderAndStatus(provider, Booking.BookingStatus.COMPLETED);
        Long cancelledBookings = bookingRepository.countByServiceProviderAndStatus(provider, Booking.BookingStatus.CANCELLED);

        // Calculate revenue (completed bookings only)
        List<Booking> completedBookingList = bookingRepository.findByServiceProviderAndStatusOrderByCreatedAtDesc(provider, Booking.BookingStatus.COMPLETED);
        java.math.BigDecimal totalRevenue = completedBookingList.stream()
                .map(Booking::getTotalAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        // Calculate pending revenue (confirmed bookings)
        List<Booking> confirmedBookingList = bookingRepository.findByServiceProviderAndStatusOrderByCreatedAtDesc(provider, Booking.BookingStatus.CONFIRMED);
        java.math.BigDecimal pendingRevenue = confirmedBookingList.stream()
                .map(Booking::getTotalAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        return new BookingStatsResponse(
                totalBookings,
                pendingBookings,
                confirmedBookings,
                completedBookings,
                cancelledBookings,
                totalRevenue,
                pendingRevenue
        );
    }

    /**
     * Get all bookings (Admin only)
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Validate status transition
     */
    private boolean isValidStatusTransition(Booking.BookingStatus currentStatus, Booking.BookingStatus newStatus) {
        return switch (currentStatus) {
            case PENDING -> newStatus == Booking.BookingStatus.CONFIRMED || 
                           newStatus == Booking.BookingStatus.CANCELLED;
            case CONFIRMED -> newStatus == Booking.BookingStatus.IN_PROGRESS || 
                             newStatus == Booking.BookingStatus.CANCELLED;
            case IN_PROGRESS -> newStatus == Booking.BookingStatus.COMPLETED || 
                               newStatus == Booking.BookingStatus.CANCELLED;
            case COMPLETED, CANCELLED -> false; // Terminal states
        };
    }
}
