package com.dancestudio.controller;

import com.dancestudio.dto.*;
import com.dancestudio.entity.*;
import com.dancestudio.repository.*;
import com.dancestudio.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private MembershipPlanRepository planRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private DanceProgramRepository programRepository;

    @Autowired
    private InstructorRepository instructorRepository;

    @Autowired
    private GalleryMediaRepository galleryRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private MembershipService membershipService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private WhatsAppService whatsAppService;

    @Autowired
    private RevenueReportService revenueReportService;

    @Autowired
    private WebsiteCmsService cmsService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ── Members ─────────────────────────────────────────────────────────────

    @GetMapping("/members")
    public ResponseEntity<List<User>> getMembers(@RequestParam(required = false) String query) {
        if (query != null && !query.isBlank()) {
            return ResponseEntity.ok(userRepository.searchMembers(query.trim()));
        }
        return ResponseEntity.ok(userRepository.findByRoleOrderByCreatedAtDesc(Role.MEMBER));
    }

    @GetMapping("/members/{id}")
    public ResponseEntity<?> getMemberDetail(@PathVariable String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Member not found"));
        Membership membership = membershipRepository.findFirstByUserIdOrderByCreatedAtDesc(id).orElse(null);
        List<Payment> payments = paymentRepository.findByUserIdOrderByPaidAtDesc(id);
        List<Invoice> invoices = invoiceRepository.findByUserIdOrderByIssueDateDesc(id);

        return ResponseEntity.ok(Map.of(
                "user", user,
                "membership", membership != null ? membership : Map.of(),
                "payments", payments,
                "invoices", invoices
        ));
    }

    @PostMapping("/members/create-offline")
    public ResponseEntity<?> createOfflineMember(@RequestBody MemberCreateRequest request) {
        try {
            Membership membership = membershipService.createOfflineMember(request);
            return ResponseEntity.ok(membership);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/members/{id}/status")
    public ResponseEntity<?> updateMemberStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (payload.containsKey("membershipStatus")) {
            user.setMembershipStatus(payload.get("membershipStatus"));
        }
        if (payload.containsKey("status")) {
            user.setStatus(payload.get("status"));
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── Payments & Invoices ──────────────────────────────────────────────────

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentRepository.findAllByOrderByPaidAtDesc());
    }

    @PostMapping("/payments/offline")
    public ResponseEntity<?> recordOfflinePayment(@RequestBody OfflinePaymentRequest request) {
        try {
            Payment payment = membershipService.recordOfflinePayment(request);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/payments/{id}/mark-paid")
    public ResponseEntity<?> markPaymentPaid(@PathVariable String id) {
        try {
            Payment payment = paymentService.markPaymentPaid(id);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceRepository.findAllByOrderByIssueDateDesc());
    }

    // ── Revenue Reports ─────────────────────────────────────────────────────

    @GetMapping("/reports")
    public ResponseEntity<RevenueStatsDTO> getRevenueReports() {
        return ResponseEntity.ok(revenueReportService.getRevenueStats());
    }

    // ── WhatsApp Reminders ──────────────────────────────────────────────────

    @PostMapping("/whatsapp/remind")
    public ResponseEntity<?> sendWhatsAppReminder(@RequestBody WhatsAppReminderRequest request) {
        try {
            Map<String, Object> result = whatsAppService.createReminder(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/whatsapp/reminders")
    public ResponseEntity<List<WhatsAppReminder>> getWhatsAppReminders() {
        return ResponseEntity.ok(whatsAppService.getAllReminders());
    }

    // ── Notifications ───────────────────────────────────────────────────────

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        return ResponseEntity.ok(Map.of(
                "notifications", notificationService.getAdminNotifications(),
                "unreadCount", notificationService.getUnreadCount()
        ));
    }

    @PostMapping("/notifications/mark-read")
    public ResponseEntity<?> markNotificationsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── Dance Programs CRUD ─────────────────────────────────────────────────

    @GetMapping("/programs")
    public ResponseEntity<List<DanceProgram>> getPrograms() {
        return ResponseEntity.ok(programRepository.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping("/programs")
    public ResponseEntity<DanceProgram> createProgram(@RequestBody DanceProgram program) {
        return ResponseEntity.ok(programRepository.save(program));
    }

    @PutMapping("/programs/{id}")
    public ResponseEntity<DanceProgram> updateProgram(@PathVariable String id, @RequestBody DanceProgram program) {
        program.setId(id);
        return ResponseEntity.ok(programRepository.save(program));
    }

    @DeleteMapping("/programs/{id}")
    public ResponseEntity<?> deleteProgram(@PathVariable String id) {
        programRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── Instructors CRUD ────────────────────────────────────────────────────

    @GetMapping("/instructors")
    public ResponseEntity<List<Instructor>> getInstructors() {
        return ResponseEntity.ok(instructorRepository.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping("/instructors")
    public ResponseEntity<Instructor> createInstructor(@RequestBody Instructor instructor) {
        return ResponseEntity.ok(instructorRepository.save(instructor));
    }

    @PutMapping("/instructors/{id}")
    public ResponseEntity<Instructor> updateInstructor(@PathVariable String id, @RequestBody Instructor instructor) {
        instructor.setId(id);
        return ResponseEntity.ok(instructorRepository.save(instructor));
    }

    @DeleteMapping("/instructors/{id}")
    public ResponseEntity<?> deleteInstructor(@PathVariable String id) {
        instructorRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── Gallery CRUD ────────────────────────────────────────────────────────

    @GetMapping("/gallery")
    public ResponseEntity<List<GalleryMedia>> getGallery() {
        return ResponseEntity.ok(galleryRepository.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping("/gallery")
    public ResponseEntity<GalleryMedia> createGalleryMedia(@RequestBody GalleryMedia media) {
        return ResponseEntity.ok(galleryRepository.save(media));
    }

    @PutMapping("/gallery/{id}")
    public ResponseEntity<GalleryMedia> updateGalleryMedia(@PathVariable String id, @RequestBody GalleryMedia media) {
        media.setId(id);
        return ResponseEntity.ok(galleryRepository.save(media));
    }

    @DeleteMapping("/gallery/{id}")
    public ResponseEntity<?> deleteGalleryMedia(@PathVariable String id) {
        galleryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── Events CRUD ─────────────────────────────────────────────────────────

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEvents() {
        return ResponseEntity.ok(eventRepository.findAllByOrderByEventDateAsc());
    }

    @PostMapping("/events")
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        return ResponseEntity.ok(eventRepository.save(event));
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable String id, @RequestBody Event event) {
        event.setId(id);
        return ResponseEntity.ok(eventRepository.save(event));
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        eventRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── Pricing Plans CRUD ──────────────────────────────────────────────────

    @GetMapping("/plans")
    public ResponseEntity<List<MembershipPlan>> getPlans() {
        return ResponseEntity.ok(planRepository.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping("/plans")
    public ResponseEntity<MembershipPlan> createPlan(@RequestBody MembershipPlan plan) {
        return ResponseEntity.ok(planRepository.save(plan));
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<MembershipPlan> updatePlan(@PathVariable String id, @RequestBody MembershipPlan plan) {
        plan.setId(id);
        return ResponseEntity.ok(planRepository.save(plan));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable String id) {
        planRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── Website CMS & Settings ──────────────────────────────────────────────

    @GetMapping("/cms/sections")
    public ResponseEntity<List<WebsiteContent>> getCmsSections() {
        return ResponseEntity.ok(cmsService.getAllSections());
    }

    @PostMapping("/cms/sections")
    public ResponseEntity<WebsiteContent> saveCmsSection(@RequestBody WebsiteContent content) {
        return ResponseEntity.ok(cmsService.saveSection(content));
    }

    @GetMapping("/settings")
    public ResponseEntity<StudioSettings> getSettings() {
        return ResponseEntity.ok(cmsService.getStudioSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<StudioSettings> updateSettings(@RequestBody StudioSettings settings) {
        return ResponseEntity.ok(cmsService.updateStudioSettings(settings));
    }
}
