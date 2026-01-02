package com.example.Clinic_Management_System.service;
import java.util.List;
import java.util.Optional;

import com.example.Clinic_Management_System.model.Patient;

public interface PatientService {

    Patient savePatient(Patient patient);

    Patient getPatientById(long id);

    Optional<Patient> findById(Long id);

    Patient updatePatient(Patient patient, long id);

    boolean deletePatient(long id);

    List<Patient> getAllPatients();

    Patient findByEmail(String email);
}
