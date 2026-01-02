package com.example.Clinic_Management_System.service.impl;

import com.example.Clinic_Management_System.model.Doctor;
import com.example.Clinic_Management_System.repository.DoctorRepo; 
import com.example.Clinic_Management_System.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepo doctorRepo; 

    @Override
    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepo.save(doctor);
    }

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepo.findAll();
    }

    @Override
    public Doctor getDoctorById(long id) {
        return doctorRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }

    @Override
    public Doctor updateDoctor(Doctor doctor, long id) {
        Doctor existingDoctor = doctorRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

        existingDoctor.setName(doctor.getName());
        existingDoctor.setSpecialization(doctor.getSpecialization());
        existingDoctor.setEmail(doctor.getEmail());
        existingDoctor.setPhone(doctor.getPhone());
        existingDoctor.setExperience(doctor.getExperience());
        // existingDoctor.setPassword(doctor.getPassword()); 

        return doctorRepo.save(existingDoctor);
    }

    @Override
    public boolean deleteDoctor(long id) {
        if (doctorRepo.existsById(id)) {
            doctorRepo.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public Doctor searchByName(String name) {
        return doctorRepo.findByNameContainingIgnoreCase(name);
    }

    @Override
    public Doctor filterBySpecialization(String specialization) {
        return doctorRepo.findBySpecialization(specialization);
    }

    @Override
    public Optional<Doctor> findById(Long doctorId) {
        return doctorRepo.findById(doctorId);
    }
}