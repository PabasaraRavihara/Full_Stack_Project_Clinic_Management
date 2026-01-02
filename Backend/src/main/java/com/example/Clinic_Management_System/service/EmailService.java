package com.example.Clinic_Management_System.service;

public interface EmailService {
    void sendRejectionEmail(String toEmail, String patientName, String date, String time);
}