package com.example.Clinic_Management_System.service;
import com.example.Clinic_Management_System.dto.AppointmentRequest;
import com.example.Clinic_Management_System.model.Appointment;
import java.util.List;

public interface AppointmentService {


    Appointment createAppointment(Long doctorId, Appointment appointment);

    Appointment saveAppointment(Appointment appointment);

    Appointment bookAppointment(AppointmentRequest request);
    Appointment updateStatus(Long appointmentId, String status);

    // Get appointments for a doctor
    List<Appointment> getAppointmentsByDoctor(Long doctorId);

    List<Appointment> getAllAppointments();
    Appointment getAppointmentById(long id);
    Appointment updateAppointment(Appointment appointment, long id);
    boolean deleteAppointment(long id);

    List<Appointment> getAppointmentsByDoctorId(Long id);

    Appointment addAppointment(Long id, Appointment appointment);
}
