package com.dancestudio.controller;

import com.dancestudio.entity.*;
import com.dancestudio.repository.*;
import com.dancestudio.service.WebsiteCmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private WebsiteCmsService cmsService;

    @Autowired
    private DanceProgramRepository programRepository;

    @Autowired
    private InstructorRepository instructorRepository;

    @Autowired
    private GalleryMediaRepository galleryRepository;

    @Autowired
    private MembershipPlanRepository planRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/all")
    public ResponseEntity<?> getPublicSiteData() {
        Map<String, Object> data = new HashMap<>();
        data.put("studioSettings", cmsService.getStudioSettings());
        data.put("sections", cmsService.getAllSections());
        data.put("programs", programRepository.findByIsPublishedTrueOrderByDisplayOrderAsc());
        data.put("instructors", instructorRepository.findByIsActiveTrueOrderByDisplayOrderAsc());
        data.put("gallery", galleryRepository.findByIsPublishedTrueOrderByDisplayOrderAsc());
        data.put("pricingPlans", planRepository.findByIsPublishedTrueOrderByDisplayOrderAsc());
        data.put("events", eventRepository.findByIsPublishedTrueOrderByEventDateAsc());
        data.put("activeMembersCount", userRepository.countByRole(Role.MEMBER));
        return ResponseEntity.ok(data);
    }

    @GetMapping("/studio")
    public ResponseEntity<StudioSettings> getStudioSettings() {
        return ResponseEntity.ok(cmsService.getStudioSettings());
    }

    @GetMapping("/programs")
    public ResponseEntity<List<DanceProgram>> getPrograms() {
        return ResponseEntity.ok(programRepository.findByIsPublishedTrueOrderByDisplayOrderAsc());
    }

    @GetMapping("/instructors")
    public ResponseEntity<List<Instructor>> getInstructors() {
        return ResponseEntity.ok(instructorRepository.findByIsActiveTrueOrderByDisplayOrderAsc());
    }

    @GetMapping("/gallery")
    public ResponseEntity<List<GalleryMedia>> getGallery(@RequestParam(required = false) String category) {
        if (category != null && !category.equalsIgnoreCase("All")) {
            return ResponseEntity.ok(galleryRepository.findByCategoryAndIsPublishedTrueOrderByDisplayOrderAsc(category));
        }
        return ResponseEntity.ok(galleryRepository.findByIsPublishedTrueOrderByDisplayOrderAsc());
    }

    @GetMapping("/pricing")
    public ResponseEntity<List<MembershipPlan>> getPricingPlans() {
        return ResponseEntity.ok(planRepository.findByIsPublishedTrueOrderByDisplayOrderAsc());
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEvents() {
        return ResponseEntity.ok(eventRepository.findByIsPublishedTrueOrderByEventDateAsc());
    }
}
