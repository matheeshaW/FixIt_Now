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

    // Admin Reports: Revenue by day for last 30 days (COMPLETED only)
    @Query(value = "SELECT DATE(booking_date) AS day, SUM(total_amount) AS revenue " +
            "FROM bookings " +
            "WHERE status = 'COMPLETED' AND booking_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) " +
            "GROUP BY DATE(booking_date) " +
            "ORDER BY day ASC", nativeQuery = true)
    List<Object[]> findRevenueByDayLast30Days();

    // Admin Reports: Booking status distribution
    @Query(value = "SELECT status, COUNT(*) AS cnt FROM bookings GROUP BY status", nativeQuery = true)
    List<Object[]> countBookingsByStatus();

    // Admin Reports: Top 5 services by number of bookings
    @Query(value = "SELECT s.service_title AS serviceTitle, COUNT(b.booking_id) AS cnt " +
            "FROM bookings b JOIN services s ON b.service_id = s.service_id " +
            "GROUP BY s.service_id, s.service_title " +
            "ORDER BY cnt DESC LIMIT 5", nativeQuery = true)
    List<Object[]> findTopServicesByBookings();

    // Admin Reports: Top 5 providers by completed bookings and avg rating
    @Query(value = "SELECT u.user_id AS providerId, u.full_name AS providerName, " +
            "COUNT(CASE WHEN b.status = 'COMPLETED' THEN 1 END) AS completedCount, " +
            "COALESCE(AVG(r.rating), 0) AS avgRating " +
            "FROM users u " +
            "JOIN services s ON s.provider_id = u.user_id " +
            "LEFT JOIN bookings b ON b.service_id = s.service_id " +
            "LEFT JOIN reviews r ON r.provider_id = u.user_id " +
            "GROUP BY u.user_id, u.full_name " +
            "ORDER BY completedCount DESC LIMIT 5", nativeQuery = true)
    List<Object[]> findTopProviders();

    // Admin Reports: Top 5 customers by total bookings
    @Query(value = "SELECT u.full_name AS customerName, COUNT(b.booking_id) AS cnt " +
            "FROM bookings b JOIN users u ON b.customer_id = u.user_id " +
            "GROUP BY u.user_id, u.full_name " +
            "ORDER BY cnt DESC LIMIT 5", nativeQuery = true)
    List<Object[]> findTopCustomersByBookings();
}
