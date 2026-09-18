package com.dancestudio.service;

import com.dancestudio.dto.VerifyPaymentRequest;
import com.dancestudio.entity.*;
import com.dancestudio.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private MembershipPlanRepository planRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Value("${app.razorpay.key-secret:YOUR_KEY_SECRET_HERE}")
    private String razorpayKeySecret;

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

    public List<Payment> getAllPayments() {
        return paymentRepository.findAllByOrderByPaidAtDesc();
    }

    public List<Payment> getPaymentsByUser(String userId) {
        return paymentRepository.findByUserIdOrderByPaidAtDesc(userId);
    }

    @Transactional
    public Payment markPaymentPaid(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        payment.setStatus("COMPLETED");
        payment.setPaidAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        if (payment.getMembership() != null) {
            Membership membership = payment.getMembership();
            membership.setStatus("ACTIVE");
            membership.setAmountPaid(payment.getAmount());
            membership.setPendingAmount(0.0);
            membershipRepository.save(membership);
        }

        User user = payment.getUser();
        user.setMembershipStatus("ACTIVE");
        userRepository.save(user);

        // Generate invoice if not exists
        if (invoiceRepository.findByPaymentId(payment.getId()).isEmpty()) {
            Invoice invoice = new Invoice();
            invoice.setInvoiceNumber(generateInvoiceNumber());
            invoice.setUser(user);
            invoice.setPayment(payment);
            invoice.setMembership(payment.getMembership());
            invoice.setPlanName(payment.getPlan() != null ? payment.getPlan().getName() : "Dance Class Membership");
            invoice.setAmount(payment.getAmount());
            invoice.setPaymentMethod(payment.getPaymentMethod());
            invoice.setPaymentStatus("PAID");
            invoice.setIssueDate(LocalDateTime.now());
            if (payment.getMembership() != null) {
                invoice.setStartDate(payment.getMembership().getStartDate());
                invoice.setEndDate(payment.getMembership().getExpiryDate());
            }
            invoiceRepository.save(invoice);
        }

        return payment;
    }

    @Transactional
    public Membership verifyAndActivateOnlinePayment(String userEmail, VerifyPaymentRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        MembershipPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found: " + request.getPlanId()));

        // Verify Razorpay HMAC signature if configured
        if (razorpayKeySecret != null && !razorpayKeySecret.equals("YOUR_KEY_SECRET_HERE") && !razorpayKeySecret.isBlank()) {
            String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
            String expectedSignature = calculateHmacSha256(payload, razorpayKeySecret);
            if (!expectedSignature.equals(request.getRazorpaySignature())) {
                throw new RuntimeException("Invalid payment signature verification");
            }
        }

        // Activate membership
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
        membership.setSource("ONLINE");

        membership = membershipRepository.save(membership);

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setMembership(membership);
        payment.setPlan(plan);
        payment.setAmount(plan.getPrice());
        payment.setStatus("COMPLETED");
        payment.setPaymentMethod("RAZORPAY");
        payment.setSource("ONLINE");
        payment.setDescription(plan.getName() + " - Online Payment");
        payment.setPaidAt(LocalDateTime.now());
        payment.setRazorpayOrderId(request.getRazorpayOrderId());
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setReferenceNumber(request.getRazorpayPaymentId());

        payment = paymentRepository.save(payment);

        user.setMembershipStatus("ACTIVE");
        userRepository.save(user);

        // Generate digital invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setUser(user);
        invoice.setPayment(payment);
        invoice.setMembership(membership);
        invoice.setPlanName(plan.getName());
        invoice.setAmount(plan.getPrice());
        invoice.setPaymentMethod("RAZORPAY");
        invoice.setPaymentStatus("PAID");
        invoice.setIssueDate(LocalDateTime.now());
        invoice.setStartDate(membership.getStartDate());
        invoice.setEndDate(membership.getExpiryDate());
        invoice.setTransactionId(request.getRazorpayPaymentId());

        invoiceRepository.save(invoice);

        // Notification to Admin
        Notification notif = new Notification(
                "ADMIN",
                "💳 New Online Payment Received",
                user.getFullName() + " paid ₹" + plan.getPrice() + " for " + plan.getName() + " via Razorpay",
                "PAYMENT_RECEIVED",
                "/admin?tab=payments"
        );
        notificationRepository.save(notif);

        return membership;
    }

    private String calculateHmacSha256(String data, String secret) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC signature", e);
        }
    }
}
