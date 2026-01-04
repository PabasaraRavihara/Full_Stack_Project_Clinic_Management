package com.example.Clinic_Management_System.service;

import com.example.Clinic_Management_System.dto.AppointmentRequest;
import com.example.Clinic_Management_System.model.Appointment;
import java.util.List;
import java.util.Optional;

public interface AppointmentService {

    // Patient Booking Logic (DTO -> Entity)
    Appointment bookAppointment(AppointmentRequest request);

    // General Save (For updates or simple saves)
    Appointment saveAppointment(Appointment appointment);

    // Status Update (Accept/Reject)
    Appointment updateStatus(Long appointmentId, String status);

    // Get All
    List<Appointment> getAllAppointments();

    // Get Single by ID (Optional - for Controller compatibility)
    Optional<Appointment> findById(Long id);

    // Get Appointments by Doctor
    List<Appointment> getAppointmentsByDoctorId(Long doctorId);

    // Delete
    boolean deleteAppointment(Long id);
}