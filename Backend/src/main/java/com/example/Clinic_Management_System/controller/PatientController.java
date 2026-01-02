package com.example.Clinic_Management_System.controller;

import com.example.Clinic_Management_System.model.Patient;
import com.example.Clinic_Management_System.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map; // Map json data handling

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173") // Frontend Connection
public class PatientController {

    private final PatientService service;

    public PatientController(PatientService service) {
        this.service = service;
    }

    // --- NEW: LOGIN METHOD ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        // 1. Email looking Patient 
        Patient patient = service.findByEmail(email);

        // 2. Patient and Password matching check
        if (patient != null && patient.getPassword().equals(password)) {
            return ResponseEntity.ok(patient); // Success: Patient Object 
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Email or Password");
        }
    }
    // -------------------------

    @GetMapping
    public List<Patient> getAll() { return service.getAllPatients(); }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(p -> new ResponseEntity<>(p, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Patient> create(@RequestBody Patient patient) {
        
        
        Patient saved = service.savePatient(patient);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> update(@PathVariable Long id, @RequestBody Patient patient) {
        return service.findById(id).map(existing -> {
            existing.setFirstName(patient.getFirstName());
            existing.setLastName(patient.getLastName());
            existing.setEmail(patient.getEmail());
            // Password update 
            return new ResponseEntity<>(service.savePatient(existing), HttpStatus.OK);
        }).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}