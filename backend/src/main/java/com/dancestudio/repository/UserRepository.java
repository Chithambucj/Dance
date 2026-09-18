package com.dancestudio.repository;

import com.dancestudio.entity.Role;
import com.dancestudio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByRoleOrderByCreatedAtDesc(Role role);
    List<User> findByMembershipStatus(String membershipStatus);
    long countByRole(Role role);
    long countByRoleAndMembershipStatus(Role role, String membershipStatus);

    @Query("SELECT u FROM User u WHERE u.role = 'MEMBER' AND (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR u.phone LIKE CONCAT('%', :query, '%'))")
    List<User> searchMembers(String query);
}
