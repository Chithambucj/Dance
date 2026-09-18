package com.dancestudio.service;

import com.dancestudio.dto.WhatsAppReminderRequest;
import com.dancestudio.entity.StudioSettings;
import com.dancestudio.entity.User;
import com.dancestudio.entity.WhatsAppReminder;
import com.dancestudio.repository.StudioSettingsRepository;
import com.dancestudio.repository.UserRepository;
import com.dancestudio.repository.WhatsAppReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WhatsAppService {

    @Autowired
    private WhatsAppReminderRepository reminderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudioSettingsRepository studioSettingsRepository;

    public Map<String, Object> createReminder(WhatsAppReminderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUserId()));

        StudioSettings settings = studioSettingsRepository.findById("default")
                .orElse(new StudioSettings());

        String phone = request.getPhone() != null && !request.getPhone().isBlank()
                ? request.getPhone()
                : (user.getPhone() != null ? user.getPhone() : "");

        String rawPhone = phone.replaceAll("[^0-9]", "");
        if (rawPhone.length() == 10) {
            rawPhone = "91" + rawPhone;
        }

        Double amount = request.getPendingAmount() != null ? request.getPendingAmount() : 1500.0;

        String message = request.getCustomMessage() != null && !request.getCustomMessage().isBlank()
                ? request.getCustomMessage()
                : "Hello " + user.getFirstName() + ",\n\n" +
                "Your dance class membership payment of ₹" + String.format("%,.0f", amount) + " is currently pending.\n\n" +
                "Please complete your payment to continue your classes seamlessly.\n\n" +
                "Thank you,\n" + settings.getStudioName();

        WhatsAppReminder reminder = new WhatsAppReminder();
        reminder.setUser(user);
        reminder.setPhone(phone);
        reminder.setMessage(message);
        reminder.setPendingAmount(amount);
        reminder.setStatus("SENT");
        reminderRepository.save(reminder);

        String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
        String waLink = "https://wa.me/" + rawPhone + "?text=" + encodedMessage;

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("waLink", waLink);
        result.put("message", message);
        result.put("phone", rawPhone);
        return result;
    }

    public List<WhatsAppReminder> getAllReminders() {
        return reminderRepository.findAllByOrderBySentAtDesc();
    }
}
