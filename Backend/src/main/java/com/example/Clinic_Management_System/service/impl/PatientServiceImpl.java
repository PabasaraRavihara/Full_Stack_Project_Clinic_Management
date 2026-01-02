package com.example.Clinic_Management_System.service.impl;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.Clinic_Management_System.model.Patient;
import com.example.Clinic_Management_System.repository.PatientRepositary;
import com.example.Clinic_Management_System.service.PatientService;

@Service
public class PatientServiceImpl implements PatientService {

    @Autowired
    private PatientRepositary patientRepositary;

   

    @Override
    public Patient savePatient(Patient patient) {
        return patientRepositary.save(patient);
    }

    
    @Override
    public Patient findByEmail(String email) {
        return patientRepositary.findByEmail(email);
    }
    // ----------------------------------------------------------------

    @Override
    public Patient getPatientById(long id) {
        return patientRepositary.findById(id).orElse(null);
    }

    @Override
    public Optional<Patient> findById(Long id) {
        return patientRepositary.findById(id);
    }

    // ... ( updatePatient, deletePatient, getAllPatients ) ...
    
    @Override
    public Patient updatePatient(Patient patient, long id) {
        
         Patient existingPatient = patientRepositary.findById(id).orElse(null);
         if (existingPatient == null) return null;
         
         existingPatient.setFirstName(patient.getFirstName());
         existingPatient.setLastName(patient.getLastName());
         
         
         return patientRepositary.save(existingPatient);
    }

    @Override
    public boolean deletePatient(long id) {
        
        Optional<Patient> p = patientRepositary.findById(id);
        if (p.isPresent()) {
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