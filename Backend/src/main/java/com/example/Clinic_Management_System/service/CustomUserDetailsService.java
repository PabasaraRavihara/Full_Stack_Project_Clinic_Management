package com.example.Clinic_Management_System.service;

import com.example.Clinic_Management_System.model.Admin;
import com.example.Clinic_Management_System.model.Doctor;
import com.example.Clinic_Management_System.model.Patient;
import com.example.Clinic_Management_System.repository.AdminRepository;
import com.example.Clinic_Management_System.repository.DoctorRepo;
import com.example.Clinic_Management_System.repository.PatientRepositary; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private DoctorRepo doctorRepo; 

    @Autowired
    private PatientRepositary patientRepositary;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Convert email to lower case for case-insensitive matching
        String searchEmail = email.toLowerCase().trim();

        // 1. Check Admin
        Optional<Admin> admin = adminRepository.findByEmail(searchEmail);
        if (admin.isPresent()) {
            return new User(
                admin.get().getEmail(), 
                admin.get().getPassword(), 
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")) 
            );
        }

        // 2. Check Doctor
        Optional<Doctor> doctor = doctorRepo.findByEmail(searchEmail); 
        if (doctor.isPresent()) {           
            return new User(
                doctor.get().getEmail(), 
                doctor.get().getPassword(), 
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_DOCTOR"))
            );
        }

        // 3. Check Patient (Updated to Optional for safety)
        Optional<Patient> patient = Optional.ofNullable(patientRepositary.findByEmail(searchEmail));
        if (patient.isPresent()) {
            return new User(
                patient.get().getEmail(),
                patient.get().getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_PATIENT"))
            );
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
