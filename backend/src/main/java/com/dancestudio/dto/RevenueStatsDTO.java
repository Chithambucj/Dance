package com.dancestudio.dto;

import java.util.List;
import java.util.Map;

public class RevenueStatsDTO {
    private Double totalRevenue;
    private Double thisMonthRevenue;
    private Double pendingAmount;
    private Long activeMembersCount;
    private Long freeTrialMembersCount;
    private Long pendingPaymentsCount;
    private Double cashCollection;
    private Double onlineCollection;
    private List<Map<String, Object>> monthlyRevenue;
    private List<Map<String, Object>> planRevenue;

    public RevenueStatsDTO() {}

    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }

    public Double getThisMonthRevenue() { return thisMonthRevenue; }
    public void setThisMonthRevenue(Double thisMonthRevenue) { this.thisMonthRevenue = thisMonthRevenue; }

    public Double getPendingAmount() { return pendingAmount; }
    public void setPendingAmount(Double pendingAmount) { this.pendingAmount = pendingAmount; }

    public Long getActiveMembersCount() { return activeMembersCount; }
    public void setActiveMembersCount(Long activeMembersCount) { this.activeMembersCount = activeMembersCount; }

    public Long getFreeTrialMembersCount() { return freeTrialMembersCount; }
    public void setFreeTrialMembersCount(Long freeTrialMembersCount) { this.freeTrialMembersCount = freeTrialMembersCount; }

    public Long getPendingPaymentsCount() { return pendingPaymentsCount; }
    public void setPendingPaymentsCount(Long pendingPaymentsCount) { this.pendingPaymentsCount = pendingPaymentsCount; }

    public Double getCashCollection() { return cashCollection; }
    public void setCashCollection(Double cashCollection) { this.cashCollection = cashCollection; }

    public Double getOnlineCollection() { return onlineCollection; }
    public void setOnlineCollection(Double onlineCollection) { this.onlineCollection = onlineCollection; }

    public List<Map<String, Object>> getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(List<Map<String, Object>> monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }

    public List<Map<String, Object>> getPlanRevenue() { return planRevenue; }
    public void setPlanRevenue(List<Map<String, Object>> planRevenue) { this.planRevenue = planRevenue; }
}
