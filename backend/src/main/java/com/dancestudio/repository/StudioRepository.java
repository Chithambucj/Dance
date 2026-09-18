package com.dancestudio.repository;

import com.dancestudio.entity.Studio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudioRepository extends JpaRepository<Studio, String> {
    Optional<Studio> findByCode(String code);
}
