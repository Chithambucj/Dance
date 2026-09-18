package com.dancestudio.controller;

import com.dancestudio.dto.AuthResponse;
import com.dancestudio.dto.FreeTrialRequest;
import com.dancestudio.entity.FreeTrial;
import com.dancestudio.entity.Membership;
import com.dancestudio.service.FreeTrialService;
import com.dancestudio.service.MembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/free-trials")
public class FreeTrialController {

    @Autowired
    private FreeTrialService freeTrialService;

    @Autowired
    private MembershipService membershipService;

    @PostMapping("/register")
    public ResponseEntity<?> registerFreeTrial(@RequestBody FreeTrialRequest request) {
        try {
            AuthResponse response = freeTrialService.registerFreeTrial(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<FreeTrial>> getAllTrials() {
        return ResponseEntity.ok(freeTrialService.getAllTrials());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }
        return ResponseEntity.ok(freeTrialService.updateTrialStatus(id, status));
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<?> convertToPaid(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        try {
            String planId = payload.get("planId");
            String paymentMethod = payload.getOrDefault("paymentMethod", "CASH");
            Membership membership = membershipService.convertFreeTrialToPaid(id, planId, paymentMethod);
            return ResponseEntity.ok(membership);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
