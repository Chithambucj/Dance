package com.dancestudio.repository;

import com.dancestudio.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, String> {
    List<Instructor> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<Instructor> findAllByOrderByDisplayOrderAsc();
}
