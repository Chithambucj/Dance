package com.dancestudio.repository;

import com.dancestudio.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByUserIdOrderByPaidAtDesc(String userId);
    List<Payment> findAllByOrderByPaidAtDesc();
    List<Payment> findByStatus(String status);
    List<Payment> findByStatusOrderByCreatedAtDesc(String status);
    List<Payment> findByPaidAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED'")
    Double getTotalRevenue();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED' AND p.paidAt >= :since")
    Double getRevenueSince(LocalDateTime since);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'PENDING'")
    Double getTotalPendingAmount();

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'PENDING'")
    long countPendingPayments();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED' AND p.source = 'ONLINE'")
    Double getOnlineRevenue();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED' AND p.source = 'OFFLINE'")
    Double getOfflineRevenue();
}
