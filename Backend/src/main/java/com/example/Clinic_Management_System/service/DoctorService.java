package com.example.Clinic_Management_System.service;

import com.example.Clinic_Management_System.model.Doctor;
import java.util.List;
import java.util.Optional;

public interface DoctorService {
    
    Doctor saveDoctor(Doctor doctor);
    
    List<Doctor> getAllDoctors();
    
    Doctor getDoctorById(long id);
    
    Doctor updateDoctor(Doctor doctor, long id);
    
    boolean deleteDoctor(long id);

    Doctor searchByName(String name);
    
    Doctor filterBySpecialization(String specialization);

   
    Optional<Doctor> findById(Long doctorId);

    boolean emailExists(String email);

    Doctor createDoctor(Doctor doctor);
}