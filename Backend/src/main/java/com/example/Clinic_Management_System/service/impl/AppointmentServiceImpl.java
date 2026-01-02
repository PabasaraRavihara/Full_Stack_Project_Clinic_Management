package com.example.Clinic_Management_System.service.impl;

import java.time.LocalDateTime;
import java.util.List;

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
    private AppointmentRepositary appointmentRepositary;

    @Autowired
    private DoctorRepo doctorRepository;

    @Autowired
    private PatientRepositary patientRepository;

    @Autowired
    private EmailService emailService;

   

    //  Add Appointment for a specific doctor
    @Override
    public Appointment addAppointment(Long doctorId, Appointment appointment) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));
        appointment.setDoctor(doctor);
        return appointmentRepositary.save(appointment);
    }

    //  Get appointments for a specific doctor
    @Override
    public List<Appointment> getAppointmentsByDoctorId(Long doctorId) {
        return appointmentRepositary.findByDoctorId(doctorId);
    }

    //  Create Appointment (general)
    @Override
    public Appointment createAppointment(Long doctorId, Appointment appointment) {
        return addAppointment(doctorId, appointment);
    }

    //  Save appointment in the database
    @Override
    public Appointment saveAppointment(Appointment appointment) {
        return appointmentRepositary.save(appointment);
    }

    @Override
    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return null;
    }

    //  Get all appointments
    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentRepositary.findAll();
    }

    //  Get appointment by ID
    @Override
    public Appointment getAppointmentById(long id) {
        return appointmentRepositary.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));
    }

    // Update appointment
    @Override
    public Appointment updateAppointment(Appointment appointment, long id) {
        Appointment existingAppointment = appointmentRepositary.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        existingAppointment.setDate(appointment.getDate());
        existingAppointment.setTime(appointment.getTime());
        existingAppointment.setDoctor(appointment.getDoctor());
        existingAppointment.setPatient(appointment.getPatient());
        existingAppointment.setStatus(appointment.getStatus());

        return appointmentRepositary.save(existingAppointment);
    }

    @Override
    public boolean deleteAppointment(long id) {
        if (!appointmentRepositary.existsById(id)) {
            return false;
        }
        appointmentRepositary.deleteById(id);
        return true;
    }

    // --- New Features (Updated bookAppointment) ---

  
    @Override
    public Appointment bookAppointment(AppointmentRequest request) {
        
        // --- NEW: Double Booking Validation Start ---
    
        boolean isTaken = appointmentRepositary.existsByDoctorIdAndDateAndTimeAndStatusNot(
                request.getDoctorId(), 
                request.getDate(), 
                request.getTime(), 
                "REJECTED"
        );

        if (isTaken) {
            throw new RuntimeException("This time slot is already booked! Please choose another time.");
        }
        // --- NEW: Double Booking Validation End ---

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setDate(request.getDate());
        appointment.setTime(request.getTime());
        appointment.setNotes(request.getNotes());
        appointment.setStatus("PENDING");
        // DateTime 
        appointment.setAppointmentTime(LocalDateTime.of(request.getDate(), request.getTime()));

        return appointmentRepositary.save(appointment);
    }

    // 2. Status  Update  Email  (Accept/Reject)
    @Override
    public Appointment updateStatus(Long appointmentId, String status) {
        Appointment appointment = appointmentRepositary.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus(status);
        Appointment updatedAppointment = appointmentRepositary.save(appointment);

        // REJECTED  Email 
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
}