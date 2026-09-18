package com.dancestudio.service;

import com.dancestudio.entity.Notification;
import com.dancestudio.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getAdminNotifications() {
        return notificationRepository.findByTargetRoleOrderByCreatedAtDesc("ADMIN");
    }

    public long getUnreadCount() {
        return notificationRepository.countByTargetRoleAndIsReadFalse("ADMIN");
    }

    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findByTargetRoleAndIsReadFalseOrderByCreatedAtDesc("ADMIN");
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
