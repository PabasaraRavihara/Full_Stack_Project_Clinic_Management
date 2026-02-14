package com.example.Clinic_Management_System.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Clinic_Management_System.dto.AppointmentRequest;
import com.example.Clinic_Management_System.model.Appointment;
import com.example.Clinic_Management_System.model.Doctor;
import com.example.Clinic_Management_System.model.Patient;
import com.example.Clinic_Management_System.repository.AppointmentRepositary; 
import com.example.Clinic_Management_System.repository.DoctorRepo;
import com.example.Clinic_Management_System.repository.PatientRepositary;
import com.example.Clinic_Management_System.service.AppointmentService;
import com.example.Clinic_Management_System.service.EmailService;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepositary appointmentRepository;

    @Autowired
    private DoctorRepo doctorRepository;

    @Autowired
    private PatientRepositary patientRepository;

    @Autowired
    private EmailService emailService;

    // --- 1. PATIENT BOOKING (With Validation) ---
    @Override
    public Appointment bookAppointment(AppointmentRequest request) {
        
        // Validation: Double Booking Check
        boolean isTaken = appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatusNot(
                request.getDoctorId(), 
                request.getDate(), 
                request.getTime(), 
                "REJECTED" 
        );

        if (isTaken) {
            throw new RuntimeException("This time slot is already booked! Please choose another time.");
        }

        // Fetch Entities
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + request.getPatientId()));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + request.getDoctorId()));

        // Create Object
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setDate(request.getDate());
        appointment.setTime(request.getTime());
        appointment.setNotes(request.getNotes());
        appointment.setStatus("PENDING");
        appointment.setAppointmentTime(LocalDateTime.of(request.getDate(), request.getTime()));

        return appointmentRepository.save(appointment);
    }

    // --- 2. DOCTOR STATUS UPDATE (With Email) ---
    @Override
    public Appointment updateStatus(Long appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus(status);
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Send Email only if REJECTED
        if ("REJECTED".equalsIgnoreCase(status)) {
            String patientEmail = appointment.getPatient().getEmail();
            if (patientEmail != null && !patientEmail.isEmpty()) {
                emailService.sendRejectionEmail(
                        patientEmail,
                        appointment.getPatient().getFirstName(),
                        appointment.getDate().toString(),
                        appointment.getTime().toString()
                );
            }
        }
        return updatedAppointment;
    }

    // --- 3. GENERAL METHODS ---

    @Override
    public Appointment saveAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> getAllAppointments() {
        // සියලුම ඇපොයින්මන්ට්ස් ලබාදේ. Frontend එකෙන් filtering සිදුකෙරේ.
        return appointmentRepository.findAll();
    }

    @Override
    public Optional<Appointment> findById(Long id) {
        return appointmentRepository.findById(id);
    }

    @Override
    public List<Appointment> getAppointmentsByDoctorId(Long doctorId) {
        // විශේෂිත දොස්තරවරයාට පමණක් ඇපොයින්මන්ට්ස් ලබාදේ.
        return appointmentRepository.findByDoctorId(doctorId);
    }

    @Override
    public boolean deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            return false;
        }
        appointmentRepository.deleteById(id);
        return true;
    }
}
