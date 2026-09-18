package com.dancestudio.service;

import com.dancestudio.dto.RevenueStatsDTO;
import com.dancestudio.entity.MembershipPlan;
import com.dancestudio.entity.Payment;
import com.dancestudio.entity.Role;
import com.dancestudio.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class RevenueReportService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FreeTrialRepository freeTrialRepository;

    @Autowired
    private MembershipPlanRepository planRepository;

    public RevenueStatsDTO getRevenueStats() {
        RevenueStatsDTO dto = new RevenueStatsDTO();

        Double totalRevenue = paymentRepository.getTotalRevenue();
        dto.setTotalRevenue(totalRevenue != null ? totalRevenue : 0.0);

        LocalDateTime firstDayOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        Double thisMonthRevenue = paymentRepository.getRevenueSince(firstDayOfMonth);
        dto.setThisMonthRevenue(thisMonthRevenue != null ? thisMonthRevenue : 0.0);

        Double pendingAmount = paymentRepository.getTotalPendingAmount();
        dto.setPendingAmount(pendingAmount != null ? pendingAmount : 0.0);

        dto.setActiveMembersCount(userRepository.countByRoleAndMembershipStatus(Role.MEMBER, "ACTIVE"));
        dto.setFreeTrialMembersCount(userRepository.countByRoleAndMembershipStatus(Role.MEMBER, "FREE_TRIAL"));
        dto.setPendingPaymentsCount(paymentRepository.countPendingPayments());

        Double cash = paymentRepository.getOfflineRevenue();
        Double online = paymentRepository.getOnlineRevenue();
        dto.setCashCollection(cash != null ? cash : 0.0);
        dto.setOnlineCollection(online != null ? online : 0.0);

        // Monthly Breakdown for last 6 months
        List<Map<String, Object>> monthly = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            LocalDateTime start = ym.atDay(1).atStartOfDay();
            LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);

            List<Payment> paymentsInMonth = paymentRepository.findByPaidAtBetween(start, end);
            double sum = paymentsInMonth.stream()
                    .filter(p -> "COMPLETED".equalsIgnoreCase(p.getStatus()))
                    .mapToDouble(Payment::getAmount)
                    .sum();

            Map<String, Object> item = new HashMap<>();
            item.put("month", ym.format(monthFormatter));
            item.put("revenue", sum);
            monthly.add(item);
        }
        dto.setMonthlyRevenue(monthly);

        // Plan Revenue Breakdown
        List<Map<String, Object>> planStats = new ArrayList<>();
        List<MembershipPlan> plans = planRepository.findAll();
        List<Payment> allPayments = paymentRepository.findByStatus("COMPLETED");

        for (MembershipPlan p : plans) {
            double planSum = allPayments.stream()
                    .filter(pay -> pay.getPlan() != null && pay.getPlan().getId().equals(p.getId()))
                    .mapToDouble(Payment::getAmount)
                    .sum();

            Map<String, Object> item = new HashMap<>();
            item.put("planName", p.getName());
            item.put("amount", planSum);
            planStats.add(item);
        }
        dto.setPlanRevenue(planStats);

        return dto;
    }
}
