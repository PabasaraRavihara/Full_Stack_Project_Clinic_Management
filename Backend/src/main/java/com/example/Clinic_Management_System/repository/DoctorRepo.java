package com.example.Clinic_Management_System.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Clinic_Management_System.model.Doctor;

// 'DoctorRepo' JPA Repository
public interface DoctorRepo extends JpaRepository<Doctor, Long> {
    
    Doctor findByNameContainingIgnoreCase(String name);
    Doctor findBySpecialization(String specialization);
    Optional<Doctor> findByEmail(String email);
}