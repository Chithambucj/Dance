package com.dancestudio.service;

import com.dancestudio.entity.MembershipPlan;
import com.dancestudio.repository.MembershipPlanRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class RazorpayService {

    @Autowired
    private MembershipPlanRepository planRepository;

    @Value("${app.razorpay.key-id:rzp_test_YOUR_KEY_ID_HERE}")
    private String keyId;

    @Value("${app.razorpay.key-secret:YOUR_KEY_SECRET_HERE}")
    private String keySecret;

    public Map<String, Object> createOrder(String planId) {
        MembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found: " + planId));

        int amountInPaise = (int) Math.round(plan.getPrice() * 100);
        String receipt = "rcpt_" + UUID.randomUUID().toString().substring(0, 8);

        Map<String, Object> response = new HashMap<>();
        response.put("keyId", keyId.equals("rzp_test_YOUR_KEY_ID_HERE") ? "" : keyId);
        response.put("amount", amountInPaise);
        response.put("currency", "INR");
        response.put("planName", plan.getName());
        response.put("planPrice", plan.getPrice());

        // If keys are valid, use Razorpay client
        if (keyId != null && !keyId.isBlank() && !keyId.equals("rzp_test_YOUR_KEY_ID_HERE")
                && keySecret != null && !keySecret.isBlank() && !keySecret.equals("YOUR_KEY_SECRET_HERE")) {
            try {
                RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", amountInPaise);
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", receipt);
                Order order = razorpay.orders.create(orderRequest);

                response.put("orderId", order.get("id"));
                return response;
            } catch (Exception e) {
                // Fallback to simulated order ID in development
                response.put("orderId", "order_sim_" + UUID.randomUUID().toString().substring(0, 12));
                return response;
            }
        } else {
            // Simulated development mode
            response.put("orderId", "order_sim_" + UUID.randomUUID().toString().substring(0, 12));
            return response;
        }
    }
}
