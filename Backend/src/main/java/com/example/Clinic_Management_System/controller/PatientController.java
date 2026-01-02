package com.example.Clinic_Management_System.controller;

import com.example.Clinic_Management_System.model.Patient;
import com.example.Clinic_Management_System.service.PatientService;
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
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            boolean isPatient = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"));

            if (!isPatient) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: Not a PATIENT account");
            }

            String token = jwtUtil.generateToken(email, "ROLE_PATIENT");
            return ResponseEntity.ok(token);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        try {
            if (patientService.emailExists(patient.getEmail())) {
                return new ResponseEntity<>(null, HttpStatus.CONFLICT);
            }

            Patient createdPatient = patientService.createPatient(patient);
            return new ResponseEntity<>(createdPatient, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        return new ResponseEntity<>(patientService.getAllPatients(), HttpStatus.OK);
    }
}