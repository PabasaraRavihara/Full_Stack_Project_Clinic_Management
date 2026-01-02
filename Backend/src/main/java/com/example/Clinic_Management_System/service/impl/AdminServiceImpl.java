package com.example.Clinic_Management_System.service.impl;

import com.example.Clinic_Management_System.model.Admin;
import com.example.Clinic_Management_System.repository.AdminRepository;
import com.example.Clinic_Management_System.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    @Override
    public Optional<Admin> getAdminById(Long adminId) {
        return adminRepository.findById(adminId);
    }

    @Override
    public Optional<Admin> getAdminByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    @Override
    public Admin createAdmin(Admin admin) {
        return adminRepository.save(admin);
    }

    @Override
    public Admin updateAdmin(Long adminId, Admin adminDetails) {
        Optional<Admin> optionalAdmin = adminRepository.findById(adminId);
        if (optionalAdmin.isPresent()) {
            Admin existingAdmin = optionalAdmin.get();
            existingAdmin.setName(adminDetails.getName());
            existingAdmin.setEmail(adminDetails.getEmail());
            existingAdmin.setPassword(adminDetails.getPassword());
            return adminRepository.save(existingAdmin);
        }
        return null;
    }

    @Override
    public void deleteAdmin(Long adminId) {
        adminRepository.deleteById(adminId);
    }

    @Override
    public boolean adminExists(Long adminId) {
        return adminRepository.existsById(adminId);
    }

    @Override
    public boolean emailExists(String email) {
        return adminRepository.existsByEmail(email);
    }

    @Override
    public Optional<Admin> authenticate(String email, String password) {
        return adminRepository.findByEmailAndPassword(email, password);
    }
}