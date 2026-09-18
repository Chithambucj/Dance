package com.dancestudio.controller;

import com.dancestudio.entity.*;
import com.dancestudio.repository.*;
import com.dancestudio.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private FreeTrialRepository freeTrialRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<?> getMemberProfile(Authentication authentication) {
        User user = authService.getCurrentUser(authentication.getName());

        Membership membership = membershipRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId()).orElse(null);
        FreeTrial freeTrial = freeTrialRepository.findByUserId(user.getId()).orElse(null);

        Map<String, Object> data = new HashMap<>();
        data.put("user", user);
        data.put("membership", membership);
        data.put("freeTrial", freeTrial);
        data.put("recentPayments", paymentRepository.findByUserIdOrderByPaidAtDesc(user.getId()));
        data.put("invoices", invoiceRepository.findByUserIdOrderByIssueDateDesc(user.getId()));

        return ResponseEntity.ok(data);
    }

    @GetMapping("/me/membership")
    public ResponseEntity<?> getMyMembership(Authentication authentication) {
        User user = authService.getCurrentUser(authentication.getName());
        Membership membership = membershipRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId()).orElse(null);
        return ResponseEntity.ok(membership);
    }

    @GetMapping("/me/payments")
    public ResponseEntity<List<Payment>> getMyPayments(Authentication authentication) {
        User user = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(paymentRepository.findByUserIdOrderByPaidAtDesc(user.getId()));
    }

    @GetMapping("/me/invoices")
    public ResponseEntity<List<Invoice>> getMyInvoices(Authentication authentication) {
        User user = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(invoiceRepository.findByUserIdOrderByIssueDateDesc(user.getId()));
    }

    @GetMapping("/me/events")
    public ResponseEntity<List<Event>> getEvents() {
        return ResponseEntity.ok(eventRepository.findByIsPublishedTrueOrderByEventDateAsc());
    }

    @PutMapping("/me/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody Map<String, String> payload) {
        User user = authService.getCurrentUser(authentication.getName());
        if (payload.containsKey("firstName")) user.setFirstName(payload.get("firstName"));
        if (payload.containsKey("lastName")) user.setLastName(payload.get("lastName"));
        if (payload.containsKey("phone")) user.setPhone(payload.get("phone"));
        if (payload.containsKey("address")) user.setAddress(payload.get("address"));
        if (payload.containsKey("gender")) user.setGender(payload.get("gender"));

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
}
