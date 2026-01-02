package com.example.Clinic_Management_System.service;

import com.example.Clinic_Management_System.model.Admin;
import com.example.Clinic_Management_System.model.Doctor;
import com.example.Clinic_Management_System.repository.AdminRepository;
import com.example.Clinic_Management_System.repository.DoctorRepo; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private DoctorRepo doctorRepo; 

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        
        Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            return new User(admin.get().getEmail(), admin.get().getPassword(), new ArrayList<>());
        }

        Optional<Doctor> doctor = doctorRepo.findByEmail(email); 
        if (doctor.isPresent()) {
            return new User(doctor.get().getEmail(), doctor.get().getPassword(), new ArrayList<>());
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}