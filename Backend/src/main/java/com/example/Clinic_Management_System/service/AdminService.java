package com.example.Clinic_Management_System.service;

import com.example.Clinic_Management_System.model.Admin;
import java.util.List;
import java.util.Optional;

public interface AdminService {
    List<Admin> getAllAdmins();
    Optional<Admin> getAdminById(Long adminId);
    Optional<Admin> getAdminByEmail(String email);
    Admin createAdmin(Admin admin);
    Admin updateAdmin(Long adminId, Admin adminDetails);
    void deleteAdmin(Long adminId);
    boolean adminExists(Long adminId);
    boolean emailExists(String email);
    Optional<Admin> authenticate(String email, String password);
}