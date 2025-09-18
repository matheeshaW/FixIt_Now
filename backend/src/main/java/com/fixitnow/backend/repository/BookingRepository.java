package com.fixitnow.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fixitnow.backend.model.Booking;
import com.fixitnow.backend.model.Service;
import com.fixitnow.backend.model.User;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find bookings by customer
    List<Booking> findByCustomerOrderByCreatedAtDesc(User customer);

    // Find bookings by service provider (through service)
    @Query("SELECT b FROM Booking b WHERE b.service.provider = :provider ORDER BY b.createdAt DESC")
    List<Booking> findByServiceProviderOrderByCreatedAtDesc(@Param("provider") User provider);

    // Find bookings by service
    List<Booking> findByServiceOrderByCreatedAtDesc(Service service);

    // Find bookings by status
    List<Booking> findByStatusOrderByCreatedAtDesc(Booking.BookingStatus status);

    // Find bookings by customer and status
    List<Booking> findByCustomerAndStatusOrderByCreatedAtDesc(User customer, Booking.BookingStatus status);

    // Find bookings by service provider and status
    @Query("SELECT b FROM Booking b WHERE b.service.provider = :provider AND b.status = :status ORDER BY b.createdAt DESC")
    List<Booking> findByServiceProviderAndStatusOrderByCreatedAtDesc(
            @Param("provider") User provider, 
            @Param("status") Booking.BookingStatus status
    );

    // Find bookings by date range
    @Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate ORDER BY b.bookingDate ASC")
    List<Booking> findByBookingDateBetweenOrderByBookingDateAsc(
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate
    );

    // Find bookings by customer and date range
    @Query("SELECT b FROM Booking b WHERE b.customer = :customer AND b.bookingDate BETWEEN :startDate AND :endDate ORDER BY b.bookingDate ASC")
    List<Booking> findByCustomerAndBookingDateBetweenOrderByBookingDateAsc(
            @Param("customer") User customer,
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate
    );

    // Find bookings by service provider and date range
    @Query("SELECT b FROM Booking b WHERE b.service.provider = :provider AND b.bookingDate BETWEEN :startDate AND :endDate ORDER BY b.bookingDate ASC")
    List<Booking> findByServiceProviderAndBookingDateBetweenOrderByBookingDateAsc(
            @Param("provider") User provider,
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate
    );

    // Find booking by ID and customer (for security)
    Optional<Booking> findByBookingIdAndCustomer(Long bookingId, User customer);

    // Find booking by ID and service provider (for security)
    @Query("SELECT b FROM Booking b WHERE b.bookingId = :bookingId AND b.service.provider = :provider")
    Optional<Booking> findByBookingIdAndServiceProvider(@Param("bookingId") Long bookingId, @Param("provider") User provider);

    // Count bookings by status for a provider
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.service.provider = :provider AND b.status = :status")
    Long countByServiceProviderAndStatus(@Param("provider") User provider, @Param("status") Booking.BookingStatus status);

    // Count bookings by status for a customer
    Long countByCustomerAndStatus(User customer, Booking.BookingStatus status);

    // Find upcoming bookings for a provider
    @Query("SELECT b FROM Booking b WHERE b.service.provider = :provider AND b.bookingDate > :now AND b.status IN ('PENDING', 'CONFIRMED') ORDER BY b.bookingDate ASC")
    List<Booking> findUpcomingBookingsForProvider(@Param("provider") User provider, @Param("now") LocalDateTime now);

    // Find upcoming bookings for a customer
    @Query("SELECT b FROM Booking b WHERE b.customer = :customer AND b.bookingDate > :now AND b.status IN ('PENDING', 'CONFIRMED') ORDER BY b.bookingDate ASC")
    List<Booking> findUpcomingBookingsForCustomer(@Param("customer") User customer, @Param("now") LocalDateTime now);

    // Check if there's a conflicting booking for the same service at the same time
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.service = :service AND b.bookingDate = :bookingDate AND b.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS')")
    boolean existsConflictingBooking(@Param("service") Service service, @Param("bookingDate") LocalDateTime bookingDate);
}
