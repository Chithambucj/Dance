package com.dancestudio.controller;

import com.dancestudio.dto.CreateOrderRequest;
import com.dancestudio.dto.VerifyPaymentRequest;
import com.dancestudio.entity.Membership;
import com.dancestudio.service.PaymentService;
import com.dancestudio.service.RazorpayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Map<String, Object> orderData = razorpayService.createOrder(request.getPlanId());
            return ResponseEntity.ok(orderData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            Authentication authentication,
            @RequestBody VerifyPaymentRequest request) {
        try {
            String userEmail = authentication.getName();
            Membership membership = paymentService.verifyAndActivateOnlinePayment(userEmail, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "membershipNumber", membership.getMembershipNumber(),
                    "planName", membership.getPlan().getName(),
                    "expiryDate", membership.getExpiryDate()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
