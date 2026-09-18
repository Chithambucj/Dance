package com.dancestudio.dto;

public class CreateOrderRequest {
    private String planId;

    public CreateOrderRequest() {}

    public CreateOrderRequest(String planId) {
        this.planId = planId;
    }

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }
}
