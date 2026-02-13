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

import java.util.HashMap; // Added Import
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173") 
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    // --- Login Part (UPDATED) ---
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
            
            // --- FIX: Fetch Patient Details to send to Frontend ---
            // NOTE: Ensure findByEmail exists in your Service/Repository
            // Filtering stream to find patient by email
            Patient patient = patientService.getAllPatients().stream()
                    .filter(p -> p.getEmail().equals(email))
                    .findFirst()
                    .orElse(null);

            if (patient == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Patient data not found");
            }

            // Create a response map with both Token and Patient Data
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("patient", patient);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }

    // --- Create Patient ---
    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        try {
            if (patientService.emailExists(patient.getEmail())) {
                return new ResponseEntity<>(null, HttpStatus.CONFLICT);
            }
            Patient createdPatient = patientService.createPatient(patient);
            return new ResponseEntity<>(createdPatient, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- Get All Patients ---
    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        return new ResponseEntity<>(patientService.getAllPatients(), HttpStatus.OK);
    }

    // --- Update Patient ---
    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patientDetails) {
        try {
            Patient updatedPatient = patientService.updatePatient(patientDetails, id);
            
            if (updatedPatient != null) {
                return new ResponseEntity<>(updatedPatient, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- Delete Patient ---
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePatient(@PathVariable Long id) {
        try {
            boolean isDeleted = patientService.deletePatient(id);
            if (isDeleted) {
                return new ResponseEntity<>("Patient deleted successfully", HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Patient not found", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error deleting patient", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}