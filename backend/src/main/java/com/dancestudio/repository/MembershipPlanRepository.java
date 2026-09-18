package com.dancestudio.repository;

import com.dancestudio.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, String> {
    List<MembershipPlan> findByIsPublishedTrueOrderByDisplayOrderAsc();
    List<MembershipPlan> findAllByOrderByDisplayOrderAsc();
}
