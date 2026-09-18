package com.dancestudio.repository;

import com.dancestudio.entity.WhatsAppReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WhatsAppReminderRepository extends JpaRepository<WhatsAppReminder, String> {
    List<WhatsAppReminder> findByUserIdOrderBySentAtDesc(String userId);
    List<WhatsAppReminder> findAllByOrderBySentAtDesc();
}
