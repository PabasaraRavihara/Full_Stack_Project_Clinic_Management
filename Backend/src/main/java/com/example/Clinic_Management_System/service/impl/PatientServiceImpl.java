package com.example.Clinic_Management_System.service.impl;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.Clinic_Management_System.model.Patient;
import com.example.Clinic_Management_System.repository.PatientRepositary; 
import com.example.Clinic_Management_System.service.PatientService;

@Service
public class PatientServiceImpl implements PatientService {

    @Autowired
    private PatientRepositary patientRepositary; 

    @Autowired
    private PasswordEncoder passwordEncoder; 

    @Override
    public Patient savePatient(Patient patient) {
        if(patient.getPassword() != null && !patient.getPassword().isEmpty()) {
            patient.setPassword(passwordEncoder.encode(patient.getPassword()));
        }
        return patientRepositary.save(patient);
    }

    @Override
    public Patient createPatient(Patient patient) {
        return savePatient(patient);
    }

    @Override
    public Patient findByEmail(String email) {
        return patientRepositary.findByEmail(email);
    }

    @Override
    public boolean emailExists(String email) {
        return patientRepositary.findByEmail(email) != null;
    }

    @Override
    public Patient getPatientById(long id) {
        return patientRepositary.findById(id).orElse(null);
    }

    @Override
    public Optional<Patient> findById(Long id) {
        return patientRepositary.findById(id);
    }

    @Override
    public Patient updatePatient(Patient patient, long id) {
        Patient existingPatient = patientRepositary.findById(id).orElse(null);
        
        if (existingPatient == null) {
            return null;
        }
        
      
        existingPatient.setFirstName(patient.getFirstName());
        existingPatient.setLastName(patient.getLastName());
        existingPatient.setEmail(patient.getEmail());
        existingPatient.setPhone(patient.getPhone());
        existingPatient.setAddress(patient.getAddress());
        existingPatient.setAge(patient.getAge());
        existingPatient.setGender(patient.getGender());

      
        if (patient.getPassword() != null && !patient.getPassword().isEmpty()) {
             existingPatient.setPassword(passwordEncoder.encode(patient.getPassword()));
        }
        
        return patientRepositary.save(existingPatient);
    }

    @Override
    public boolean deletePatient(long id) {
        if (patientRepositary.existsById(id)) {
            patientRepositary.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public List<Patient> getAllPatients() {
        return patientRepositary.findAll();
    }
}