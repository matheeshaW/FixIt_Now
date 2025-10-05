package com.fixitnow.backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fixitnow.backend.repository.BookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final BookingRepository bookingRepository;

    public List<Map<String, Object>> getRevenueLast30Days() {
        List<Object[]> raw = bookingRepository.findRevenueByDayLast30Days();
        return raw.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("date", row[0] != null ? row[0].toString() : null);
            m.put("revenue", row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO);
            return m;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getStatusDistribution() {
        List<Object[]> raw = bookingRepository.countBookingsByStatus();
        return raw.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("status", row[0] != null ? row[0].toString() : null);
            m.put("count", row[1] != null ? Long.parseLong(row[1].toString()) : 0L);
            return m;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTopServices() {
        List<Object[]> raw = bookingRepository.findTopServicesByBookings();
        return raw.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("serviceName", row[0] != null ? row[0].toString() : null);
            m.put("count", row[1] != null ? Long.parseLong(row[1].toString()) : 0L);
            return m;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTopProviders() {
        List<Object[]> raw = bookingRepository.findTopProviders();
        return raw.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("providerId", row[0] != null ? Long.parseLong(row[0].toString()) : null);
            m.put("providerName", row[1] != null ? row[1].toString() : null);
            m.put("completedCount", row[2] != null ? Long.parseLong(row[2].toString()) : 0L);
            m.put("avgRating", row[3] != null ? Double.parseDouble(row[3].toString()) : 0.0);
            return m;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTopCustomers() {
        List<Object[]> raw = bookingRepository.findTopCustomersByBookings();
        return raw.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("customerName", row[0] != null ? row[0].toString() : null);
            m.put("count", row[1] != null ? Long.parseLong(row[1].toString()) : 0L);
            return m;
        }).collect(Collectors.toList());
    }
}


