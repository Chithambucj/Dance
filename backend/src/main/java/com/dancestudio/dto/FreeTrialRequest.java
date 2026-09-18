package com.dancestudio.dto;

public class FreeTrialRequest {
    private String fullName;
    private String phone;
    private String email;
    private Integer age;
    private String dateOfBirth;
    private String programName;
    private String preferredBatch;
    private String address;
    private String emergencyContact;
    private String message;
    private String password;

    public FreeTrialRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getProgramName() { return programName; }
    public void setProgramName(String programName) { this.programName = programName; }

    public String getPreferredBatch() { return preferredBatch; }
    public void setPreferredBatch(String preferredBatch) { this.preferredBatch = preferredBatch; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
