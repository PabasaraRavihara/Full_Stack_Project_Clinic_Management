package com.example.Clinic_Management_System.controller;

import com.example.Clinic_Management_System.model.Admin;
import com.example.Clinic_Management_System.service.AdminService;
import com.example.Clinic_Management_System.service.CustomUserDetailsService;
import com.example.Clinic_Management_System.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    // ✅ 1. ADMIN LOGIN (ADMIN ONLY)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

        String email = request.get("email");
        String password = request.get("password");

        try {
            // 🔐 Authenticate email + password
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));

            // 🔎 Load user and check ROLE
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("Access denied: Not an ADMIN account");
            }

            // 🔑 Generate JWT with ROLE_ADMIN
            String token = jwtUtil.generateToken(email, "ROLE_ADMIN");

            return ResponseEntity.ok(token);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }

    // ✅ 2. CREATE ADMIN (REGISTER)
    @PostMapping
    public ResponseEntity<Admin> createAdmin(@RequestBody Admin admin) {
        try {
            if (adminService.emailExists(admin.getEmail())) {
                return new ResponseEntity<>(null, HttpStatus.CONFLICT);
            }

            // 🔐 Password encryption happens in service
            Admin createdAdmin = adminService.createAdmin(admin);
            return new ResponseEntity<>(createdAdmin, HttpStatus.CREATED);

        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ 3. GET ALL ADMINS (ADMIN ONLY – PROTECTED BY SECURITY CONFIG)
    @GetMapping
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return new ResponseEntity<>(adminService.getAllAdmins(), HttpStatus.OK);
    }
}