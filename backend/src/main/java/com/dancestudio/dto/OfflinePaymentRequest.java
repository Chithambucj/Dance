package com.dancestudio.dto;

public class OfflinePaymentRequest {
    private String userId;
    private String planId;
    private Double amount;
    private String paymentMethod = "CASH"; // CASH, UPI, BANK_TRANSFER
    private String paymentStatus = "COMPLETED"; // COMPLETED, PENDING
    private String notes;

    public OfflinePaymentRequest() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
