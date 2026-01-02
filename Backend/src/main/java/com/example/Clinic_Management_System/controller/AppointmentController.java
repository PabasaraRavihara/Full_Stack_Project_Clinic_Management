package com.example.Clinic_Management_System.controller;

import java.time.LocalDate; // DTO import
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Clinic_Management_System.dto.AppointmentRequest;
import com.example.Clinic_Management_System.model.Appointment;
import com.example.Clinic_Management_System.model.Doctor;
import com.example.Clinic_Management_System.model.Patient;
import com.example.Clinic_Management_System.service.AppointmentService;
import com.example.Clinic_Management_System.service.DoctorService;
import com.example.Clinic_Management_System.service.PatientService;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*") 
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

   
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Map<String, String> body) {
        try {
            Long patientId = Long.valueOf(body.get("patientId"));
            Long doctorId = Long.valueOf(body.get("doctorId"));

            Patient patient = patientService.findById(patientId).orElse(null);
            Doctor doctor = (Doctor) doctorService.findById(doctorId).orElse(null);

            if (patient == null || doctor == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Error: Patient ID or Doctor ID not found in database.");
            }

            Appointment appointment = new Appointment();
            appointment.setPatient(patient);
            appointment.setDoctor(doctor);
            
            if (body.get("appointmentTime") != null) {
                appointment.setAppointmentTime(LocalDateTime.parse(body.get("appointmentTime")));
            }
            if (body.get("date") != null) {
                appointment.setDate(LocalDate.parse(body.get("date")));
            }
            if (body.get("time") != null) {
                appointment.setTime(LocalTime.parse(body.get("time")));
            }

            appointment.setStatus(body.get("status"));
            appointment.setNotes(body.get("notes"));

            Appointment saved = appointmentService.saveAppointment(appointment);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

  
    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.bookAppointment(request));
    }


    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }

    // --- Get All ---
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }
}