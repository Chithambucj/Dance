package com.dancestudio.repository;

import com.dancestudio.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, String> {
    List<Membership> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Membership> findFirstByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Membership> findByMembershipNumber(String membershipNumber);
    List<Membership> findByStatus(String status);
    List<Membership> findByStatusAndExpiryDateBetween(String status, LocalDateTime start, LocalDateTime end);
    long countByStatus(String status);
}
