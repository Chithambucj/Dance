package com.dancestudio.repository;

import com.dancestudio.entity.FreeTrial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FreeTrialRepository extends JpaRepository<FreeTrial, String> {
    List<FreeTrial> findAllByOrderByCreatedAtDesc();
    List<FreeTrial> findByStatusOrderByCreatedAtDesc(String status);
    Optional<FreeTrial> findByEmail(String email);
    Optional<FreeTrial> findByUserId(String userId);
    long countByStatus(String status);
}
