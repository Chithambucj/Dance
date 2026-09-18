package com.dancestudio.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "studio_settings")
public class StudioSettings {

    @Id
    private String id = "default";

    @Column(nullable = false)
    private String studioName = "StepUp Dance Studio";

    private String tagline = "Move • Groove • Inspire";

    @Column(columnDefinition = "TEXT")
    private String description = "Premier Dance Studio offering Hip Hop, Bharatanatyam, Salsa, Contemporary, Zumba and Kids Dance.";

    private String logo;
    private String favicon = "/favicon.ico";
    private String phone = "+91 98765 43210";
    private String email = "hello@stepupdance.com";
    private String address = "124 Dance Avenue, Arts District, City Center";
    private String googleMapsUrl = "https://maps.google.com";
    private String instagram = "https://instagram.com";
    private String facebook = "https://facebook.com";
    private String youtube = "https://youtube.com";
    private String whatsapp = "+919876543210";
    private String businessHours = "Mon - Sat: 7:00 AM - 9:30 PM | Sun: 8:00 AM - 2:00 PM";
    private String currency = "INR (₹)";
    private String timezone = "Asia/Kolkata";

    private String heroTitle = "Dance Your Way";
    private String heroSubtitle = "Move • Groove • Inspire";
    private String heroButtonText = "Start Free Trial";
    private String promotionalBanner = "🎉 New Batches Starting This Month! Book Your Free Trial Today.";
    private Boolean showPromoBanner = true;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public StudioSettings() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudioName() { return studioName; }
    public void setStudioName(String studioName) { this.studioName = studioName; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public String getFavicon() { return favicon; }
    public void setFavicon(String favicon) { this.favicon = favicon; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getGoogleMapsUrl() { return googleMapsUrl; }
    public void setGoogleMapsUrl(String googleMapsUrl) { this.googleMapsUrl = googleMapsUrl; }

    public String getInstagram() { return instagram; }
    public void setInstagram(String instagram) { this.instagram = instagram; }

    public String getFacebook() { return facebook; }
    public void setFacebook(String facebook) { this.facebook = facebook; }

    public String getYoutube() { return youtube; }
    public void setYoutube(String youtube) { this.youtube = youtube; }

    public String getWhatsapp() { return whatsapp; }
    public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }

    public String getBusinessHours() { return businessHours; }
    public void setBusinessHours(String businessHours) { this.businessHours = businessHours; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getHeroTitle() { return heroTitle; }
    public void setHeroTitle(String heroTitle) { this.heroTitle = heroTitle; }

    public String getHeroSubtitle() { return heroSubtitle; }
    public void setHeroSubtitle(String heroSubtitle) { this.heroSubtitle = heroSubtitle; }

    public String getHeroButtonText() { return heroButtonText; }
    public void setHeroButtonText(String heroButtonText) { this.heroButtonText = heroButtonText; }

    public String getPromotionalBanner() { return promotionalBanner; }
    public void setPromotionalBanner(String promotionalBanner) { this.promotionalBanner = promotionalBanner; }

    public Boolean getShowPromoBanner() { return showPromoBanner; }
    public void setShowPromoBanner(Boolean showPromoBanner) { this.showPromoBanner = showPromoBanner; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
