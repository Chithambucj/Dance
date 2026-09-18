package com.dancestudio.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "website_contents")
public class WebsiteContent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String sectionKey; // hero, about, why_choose_us, stats, banners, testimonials, contact

    private String title;
    private String subtitle;
    private String heading;
    private String highlightedText;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String badgeText;
    private String primaryBtnText;
    private String primaryBtnLink;
    private String secondaryBtnText;
    private String secondaryBtnLink;
    private String image;

    @Column(columnDefinition = "TEXT")
    private String dataJson; // Complex json data for section items like testimonials or stats

    private Boolean isPublished = true;
    private LocalDateTime updatedAt = LocalDateTime.now();

    public WebsiteContent() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSectionKey() { return sectionKey; }
    public void setSectionKey(String sectionKey) { this.sectionKey = sectionKey; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getHeading() { return heading; }
    public void setHeading(String heading) { this.heading = heading; }

    public String getHighlightedText() { return highlightedText; }
    public void setHighlightedText(String highlightedText) { this.highlightedText = highlightedText; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBadgeText() { return badgeText; }
    public void setBadgeText(String badgeText) { this.badgeText = badgeText; }

    public String getPrimaryBtnText() { return primaryBtnText; }
    public void setPrimaryBtnText(String primaryBtnText) { this.primaryBtnText = primaryBtnText; }

    public String getPrimaryBtnLink() { return primaryBtnLink; }
    public void setPrimaryBtnLink(String primaryBtnLink) { this.primaryBtnLink = primaryBtnLink; }

    public String getSecondaryBtnText() { return secondaryBtnText; }
    public void setSecondaryBtnText(String secondaryBtnText) { this.secondaryBtnText = secondaryBtnText; }

    public String getSecondaryBtnLink() { return secondaryBtnLink; }
    public void setSecondaryBtnLink(String secondaryBtnLink) { this.secondaryBtnLink = secondaryBtnLink; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getDataJson() { return dataJson; }
    public void setDataJson(String dataJson) { this.dataJson = dataJson; }

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
