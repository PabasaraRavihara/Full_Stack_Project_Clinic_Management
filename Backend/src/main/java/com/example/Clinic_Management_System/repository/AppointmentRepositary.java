package com.example.Clinic_Management_System.repository;
import com.example.Clinic_Management_System.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepositary extends JpaRepository<Appointment, Long>{
    List<Appointment> findAllById(Long doctorId);

    List<Appointment> findByDoctorId(Long doctorId);


    boolean existsByDoctorIdAndDateAndTimeAndStatusNot(Long doctorId, java.time.LocalDate date, java.time.LocalTime time, String status);
}
