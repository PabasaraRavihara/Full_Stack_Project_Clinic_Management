package com.example.Clinic_Management_System.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Clinic_Management_System.model.Patient;

public interface PatientRepositary extends JpaRepository<Patient, Long>{

        Patient findByEmail(String email);

}
