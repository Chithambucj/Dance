package com.dancestudio.service;

import com.dancestudio.entity.StudioSettings;
import com.dancestudio.entity.WebsiteContent;
import com.dancestudio.repository.StudioSettingsRepository;
import com.dancestudio.repository.WebsiteContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WebsiteCmsService {

    @Autowired
    private StudioSettingsRepository studioSettingsRepository;

    @Autowired
    private WebsiteContentRepository websiteContentRepository;

    public StudioSettings getStudioSettings() {
        return studioSettingsRepository.findById("default")
                .orElseGet(() -> studioSettingsRepository.save(new StudioSettings()));
    }

    public StudioSettings updateStudioSettings(StudioSettings settings) {
        settings.setId("default");
        return studioSettingsRepository.save(settings);
    }

    public List<WebsiteContent> getAllSections() {
        return websiteContentRepository.findAll();
    }

    public Optional<WebsiteContent> getSection(String sectionKey) {
        return websiteContentRepository.findBySectionKey(sectionKey);
    }

    public WebsiteContent saveSection(WebsiteContent content) {
        Optional<WebsiteContent> existing = websiteContentRepository.findBySectionKey(content.getSectionKey());
        if (existing.isPresent()) {
            WebsiteContent target = existing.get();
            target.setTitle(content.getTitle());
            target.setSubtitle(content.getSubtitle());
            target.setHeading(content.getHeading());
            target.setHighlightedText(content.getHighlightedText());
            target.setDescription(content.getDescription());
            target.setBadgeText(content.getBadgeText());
            target.setPrimaryBtnText(content.getPrimaryBtnText());
            target.setPrimaryBtnLink(content.getPrimaryBtnLink());
            target.setSecondaryBtnText(content.getSecondaryBtnText());
            target.setSecondaryBtnLink(content.getSecondaryBtnLink());
            target.setImage(content.getImage());
            target.setDataJson(content.getDataJson());
            target.setIsPublished(content.getIsPublished());
            return websiteContentRepository.save(target);
        }
        return websiteContentRepository.save(content);
    }
}
