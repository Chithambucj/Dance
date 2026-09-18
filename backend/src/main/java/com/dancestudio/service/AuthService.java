package com.dancestudio.service;

import com.dancestudio.dto.AuthRequest;
import com.dancestudio.dto.AuthResponse;
import com.dancestudio.dto.RegisterRequest;
import com.dancestudio.entity.Role;
import com.dancestudio.entity.User;
import com.dancestudio.repository.UserRepository;
import com.dancestudio.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // Support legacy plain text if any, then re-hash
            if (user.getPassword().equals(request.getPassword())) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                userRepository.save(user);
            } else {
                throw new RuntimeException("Invalid email or password");
            }
        }

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

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("An account with this email already exists.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone());
        user.setGender(request.getGender());
        user.setAddress(request.getAddress());
        user.setRole(Role.MEMBER);
        user.setStatus("ACTIVE");
        user.setMembershipStatus("FREE_TRIAL");
        user.setAccountType("ONLINE");

        User saved = userRepository.save(user);

        String token = jwtUtils.generateToken(
                saved.getEmail(),
                saved.getRole().name(),
                saved.getId(),
                saved.getFullName(),
                saved.getMembershipStatus()
        );

        return new AuthResponse(
                token,
                saved.getId(),
                saved.getEmail(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getRole().name(),
                saved.getMembershipStatus(),
                saved.getAccountType()
        );
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}
