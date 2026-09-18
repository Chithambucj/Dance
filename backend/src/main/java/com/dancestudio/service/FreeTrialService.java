package com.dancestudio.service;

import com.dancestudio.dto.AuthResponse;
import com.dancestudio.dto.FreeTrialRequest;
import com.dancestudio.entity.FreeTrial;
import com.dancestudio.entity.Notification;
import com.dancestudio.entity.Role;
import com.dancestudio.entity.User;
import com.dancestudio.repository.FreeTrialRepository;
import com.dancestudio.repository.NotificationRepository;
import com.dancestudio.repository.UserRepository;
import com.dancestudio.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FreeTrialService {

    @Autowired
    private FreeTrialRepository freeTrialRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public AuthResponse registerFreeTrial(FreeTrialRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            String[] nameParts = request.getFullName().trim().split("\\s+", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "Student";

            String rawPassword = request.getPassword() != null && !request.getPassword().isBlank()
                    ? request.getPassword()
                    : "trial123";

            user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());
            user.setRole(Role.MEMBER);
            user.setStatus("ACTIVE");
            user.setMembershipStatus("FREE_TRIAL");
            user.setAccountType("FREE_TRIAL");

            if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
                try {
                    user.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()).atStartOfDay());
                } catch (Exception ignored) {}
            }

            user = userRepository.save(user);
        } else {
            user.setMembershipStatus("FREE_TRIAL");
            userRepository.save(user);
        }

        // Create Free Trial Lead Record
        FreeTrial trial = new FreeTrial();
        trial.setFullName(request.getFullName().trim());
        trial.setPhone(request.getPhone());
        trial.setEmail(email);
        trial.setAge(request.getAge());
        trial.setProgramName(request.getProgramName());
        trial.setPreferredBatch(request.getPreferredBatch());
        trial.setAddress(request.getAddress());
        trial.setEmergencyContact(request.getEmergencyContact());
        trial.setMessage(request.getMessage());
        trial.setStatus("NEW");
        trial.setTrialStartDate(LocalDateTime.now());
        trial.setTrialEndDate(LocalDateTime.now().plusDays(7));
        trial.setUser(user);

        freeTrialRepository.save(trial);

        // Send Admin Notification
        Notification notification = new Notification(
                "ADMIN",
                "🔔 New Free Trial Registration",
                request.getFullName() + " registered for " + request.getProgramName() + " (Phone: " + request.getPhone() + ")",
                "FREE_TRIAL",
                "/admin?tab=free-trials"
        );
        notificationRepository.save(notification);

        // Generate JWT Token for immediate member portal login
        String token = jwtUtils.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId(),
                user.getFullName(),
                user.getMembershipStatus()
        );

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getMembershipStatus(),
                user.getAccountType()
        );
    }

    public List<FreeTrial> getAllTrials() {
        return freeTrialRepository.findAllByOrderByCreatedAtDesc();
    }

    public FreeTrial getTrialById(String id) {
        return freeTrialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Free trial lead not found: " + id));
    }

    public FreeTrial updateTrialStatus(String id, String status) {
        FreeTrial trial = getTrialById(id);
        trial.setStatus(status);
        return freeTrialRepository.save(trial);
    }
}
