package com.dancestudio.repository;

import com.dancestudio.entity.GalleryMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryMediaRepository extends JpaRepository<GalleryMedia, String> {
    List<GalleryMedia> findByIsPublishedTrueOrderByDisplayOrderAsc();
    List<GalleryMedia> findByCategoryAndIsPublishedTrueOrderByDisplayOrderAsc(String category);
    List<GalleryMedia> findAllByOrderByDisplayOrderAsc();
}
