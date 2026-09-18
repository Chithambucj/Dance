package com.dancestudio.service;

import com.dancestudio.dto.MemberCreateRequest;
import com.dancestudio.dto.OfflinePaymentRequest;
import com.dancestudio.entity.*;
import com.dancestudio.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class MembershipService {

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private MembershipPlanRepository planRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private FreeTrialRepository freeTrialRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String generateMembershipNumber() {
        int year = LocalDateTime.now().getYear();
        int rand = 10000 + new Random().nextInt(90000);
        return "MEM-" + year + "-" + rand;
    }

    private String generateInvoiceNumber() {
        int year = LocalDateTime.now().getYear();
        int rand = 1000 + new Random().nextInt(9000);
        return "INV-" + year + "-" + rand;
    }

    public List<Membership> getAllMemberships() {
        return membershipRepository.findAll();
    }

    public Membership getActiveMembershipForUser(String userId) {
        return membershipRepository.findFirstByUserIdOrderByCreatedAtDesc(userId).orElse(null);
    }

    @Transactional
    public Membership createOfflineMember(MemberCreateRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "dance123"));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());
            user.setGender(request.getGender());
            user.setRole(Role.MEMBER);
            user.setAccountType("OFFLINE");
            user.setStatus("ACTIVE");
        }

        user.setMembershipStatus(request.getPaymentStatus().equalsIgnoreCase("COMPLETED") ? "ACTIVE" : "PAYMENT_PENDING");
        user = userRepository.save(user);

        MembershipPlan plan = null;
        if (request.getPlanId() != null && !request.getPlanId().isBlank()) {
            plan = planRepository.findById(request.getPlanId()).orElse(null);
        }

        if (plan == null) {
            // Default to first published plan or fallback
            List<MembershipPlan> plans = planRepository.findByIsPublishedTrueOrderByDisplayOrderAsc();
            plan = plans.isEmpty() ? null : plans.get(0);
        }

        Double amount = request.getPaymentAmount() != null ? request.getPaymentAmount() : (plan != null ? plan.getPrice() : 1500.0);
        int durationDays = plan != null ? plan.getDurationDays() : 30;

        Membership membership = new Membership();
        membership.setMembershipNumber(generateMembershipNumber());
        membership.setUser(user);
        membership.setPlan(plan);
        membership.setStartDate(LocalDateTime.now());
        membership.setExpiryDate(LocalDateTime.now().plusDays(durationDays));
        membership.setTotalFee(amount);
        membership.setAmountPaid(request.getPaymentStatus().equalsIgnoreCase("COMPLETED") ? amount : 0.0);
        membership.setPendingAmount(request.getPaymentStatus().equalsIgnoreCase("COMPLETED") ? 0.0 : amount);
        membership.setStatus(request.getPaymentStatus().equalsIgnoreCase("COMPLETED") ? "ACTIVE" : "PAYMENT_PENDING");
        membership.setSource("OFFLINE");
        membership.setNotes(request.getNotes());

        membership = membershipRepository.save(membership);

        // Record payment
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setMembership(membership);
        payment.setPlan(plan);
        payment.setAmount(amount);
        payment.setStatus(request.getPaymentStatus().equalsIgnoreCase("COMPLETED") ? "COMPLETED" : "PENDING");
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setSource("OFFLINE");
        payment.setDescription((plan != null ? plan.getName() : "Dance Class") + " - Offline Enrollment");
        payment.setNotes(request.getNotes());
        if (request.getPaymentStatus().equalsIgnoreCase("COMPLETED")) {
            payment.setPaidAt(LocalDateTime.now());
        }

        payment = paymentRepository.save(payment);

        // If completed, generate digital invoice
        if (payment.getStatus().equalsIgnoreCase("COMPLETED")) {
            Invoice invoice = new Invoice();
            invoice.setInvoiceNumber(generateInvoiceNumber());
            invoice.setUser(user);
            invoice.setPayment(payment);
            invoice.setMembership(membership);
            invoice.setPlanName(plan != null ? plan.getName() : "Dance Membership");
            invoice.setAmount(amount);
            invoice.setPaymentMethod(request.getPaymentMethod());
            invoice.setPaymentStatus("PAID");
            invoice.setIssueDate(LocalDateTime.now());
            invoice.setStartDate(membership.getStartDate());
            invoice.setEndDate(membership.getExpiryDate());
            invoice.setNotes(request.getNotes());
            invoiceRepository.save(invoice);
        }

        // Notification
        Notification notif = new Notification(
                "ADMIN",
                "New Member Added",
                user.getFullName() + " was enrolled via " + request.getPaymentMethod() + " (₹" + amount + ")",
                "MEMBER_JOINED",
                "/admin?tab=members"
        );
        notificationRepository.save(notif);

        return membership;
    }

    @Transactional
    public Payment recordOfflinePayment(OfflinePaymentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUserId()));

        MembershipPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found: " + request.getPlanId()));

        Double amount = request.getAmount() != null ? request.getAmount() : plan.getPrice();

        Membership membership = new Membership();
        membership.setMembershipNumber(generateMembershipNumber());
        membership.setUser(user);
        membership.setPlan(plan);
        membership.setStartDate(LocalDateTime.now());
        membership.setExpiryDate(LocalDateTime.now().plusDays(plan.getDurationDays()));
        membership.setTotalFee(amount);
        membership.setAmountPaid(request.getPaymentStatus().equalsIgnoreCase("COMPLETED") ? amount : 0.0);
        membership.setPendingAmount(request.getPaymentStatus().equalsIgnoreCase("COMPLETED") ? 0.0 : amount);
        membership.setStatus(request.getPaymentStatus().equalsIgnoreCase("COMPLETED") ? "ACTIVE" : "PAYMENT_PENDING");
        membership.setSource("OFFLINE");
        membership.setNotes(request.getNotes());

        membership = membershipRepository.save(membership);

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setMembership(membership);
        payment.setPlan(plan);
        payment.setAmount(amount);
        payment.setStatus(request.getPaymentStatus());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setSource("OFFLINE");
        payment.setDescription(plan.getName() + " - " + request.getPaymentMethod() + " Payment");
        payment.setNotes(request.getNotes());
        if (request.getPaymentStatus().equalsIgnoreCase("COMPLETED")) {
            payment.setPaidAt(LocalDateTime.now());
        }

        payment = paymentRepository.save(payment);

        if (payment.getStatus().equalsIgnoreCase("COMPLETED")) {
            user.setMembershipStatus("ACTIVE");
            userRepository.save(user);

            Invoice invoice = new Invoice();
            invoice.setInvoiceNumber(generateInvoiceNumber());
            invoice.setUser(user);
            invoice.setPayment(payment);
            invoice.setMembership(membership);
            invoice.setPlanName(plan.getName());
            invoice.setAmount(amount);
            invoice.setPaymentMethod(request.getPaymentMethod());
            invoice.setPaymentStatus("PAID");
            invoice.setIssueDate(LocalDateTime.now());
            invoice.setStartDate(membership.getStartDate());
            invoice.setEndDate(membership.getExpiryDate());
            invoiceRepository.save(invoice);
        }

        return payment;
    }

    @Transactional
    public Membership convertFreeTrialToPaid(String trialId, String planId, String paymentMethod) {
        FreeTrial trial = freeTrialRepository.findById(trialId)
                .orElseThrow(() -> new RuntimeException("Free trial not found: " + trialId));

        MembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found: " + planId));

        User user = trial.getUser();
        if (user == null) {
            user = userRepository.findByEmail(trial.getEmail()).orElseThrow(() -> new RuntimeException("User account not found"));
        }

        user.setMembershipStatus("ACTIVE");
        userRepository.save(user);

        Membership membership = new Membership();
        membership.setMembershipNumber(generateMembershipNumber());
        membership.setUser(user);
        membership.setPlan(plan);
        membership.setStartDate(LocalDateTime.now());
        membership.setExpiryDate(LocalDateTime.now().plusDays(plan.getDurationDays()));
        membership.setTotalFee(plan.getPrice());
        membership.setAmountPaid(plan.getPrice());
        membership.setPendingAmount(0.0);
        membership.setStatus("ACTIVE");
        membership.setSource("OFFLINE");

        membership = membershipRepository.save(membership);

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setMembership(membership);
        payment.setPlan(plan);
        payment.setAmount(plan.getPrice());
        payment.setStatus("COMPLETED");
        payment.setPaymentMethod(paymentMethod);
        payment.setSource("OFFLINE");
        payment.setDescription(plan.getName() + " - Converted from Free Trial");
        payment.setPaidAt(LocalDateTime.now());

        payment = paymentRepository.save(payment);

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setUser(user);
        invoice.setPayment(payment);
        invoice.setMembership(membership);
        invoice.setPlanName(plan.getName());
        invoice.setAmount(plan.getPrice());
        invoice.setPaymentMethod(paymentMethod);
        invoice.setPaymentStatus("PAID");
        invoice.setIssueDate(LocalDateTime.now());
        invoice.setStartDate(membership.getStartDate());
        invoice.setEndDate(membership.getExpiryDate());

        invoiceRepository.save(invoice);

        trial.setStatus("CONVERTED");
        freeTrialRepository.save(trial);

        return membership;
    }
}
