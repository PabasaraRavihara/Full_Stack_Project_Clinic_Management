package com.example.Clinic_Management_System.service.impl;

import com.example.Clinic_Management_System.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendRejectionEmail(String toEmail, String patientName, String date, String time) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("clinicmanagementsystem3@gmail.com"); // Sender's email
            message.setTo(toEmail);
            message.setSubject("Appointment Status Update - Clinic System");
            message.setText("Dear " + patientName + ",\n\n" +
                    "We regret to inform you that your appointment on " + date + 
                    " at " + time + " has been DECLINED by the doctor.\n\n" +
                    "Please contact the clinic for rescheduling.\n\n" +
                    "Thank you.");

            mailSender.send(message);
            System.out.println("Email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }
}