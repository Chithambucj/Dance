package com.dancestudio.repository;

import com.dancestudio.entity.DanceProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DanceProgramRepository extends JpaRepository<DanceProgram, String> {
    List<DanceProgram> findByIsPublishedTrueOrderByDisplayOrderAsc();
    List<DanceProgram> findAllByOrderByDisplayOrderAsc();
}
