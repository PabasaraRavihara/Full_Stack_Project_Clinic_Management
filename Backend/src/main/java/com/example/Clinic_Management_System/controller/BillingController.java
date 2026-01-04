package com.example.Clinic_Management_System.controller;

import com.example.Clinic_Management_System.model.Appointment;
import com.example.Clinic_Management_System.model.Billing;
import com.example.Clinic_Management_System.service.AppointmentService;
import com.example.Clinic_Management_System.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/billings")
@CrossOrigin(origins = "*")
public class BillingController {

    @Autowired
    private BillingService billingService;

    @Autowired
    private AppointmentService appointmentService;

    // Get All Billings
    @GetMapping
    public ResponseEntity<List<Billing>> getAllBillings() {
        return new ResponseEntity<>(billingService.getAllBillings(), HttpStatus.OK);
    }

    // Get Billing By ID
    @GetMapping("/{id}")
    public ResponseEntity<Billing> getBillingById(@PathVariable("id") Long billId) {
        Optional<Billing> billing = billingService.getBillingById(billId);
        return billing.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                      .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create Billing (Robust Logic)
    @PostMapping
    public ResponseEntity<?> createBilling(@RequestBody Map<String, Object> body) {
        try {
            // Extract Appointment ID
            Long appointmentId;
            if (body.get("appointment") instanceof Map) {
                Map<String, Object> appointmentMap = (Map<String, Object>) body.get("appointment");
                appointmentId = Long.valueOf(appointmentMap.get("id").toString());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Invalid Appointment format");
            }

            // Fetch Appointment (Use findById from service)
            Appointment appointment = appointmentService.findById(appointmentId).orElse(null);

            if (appointment == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Appointment ID not found.");
            }

            // Create Billing Object
            Billing billing = new Billing();
            
            // Safe Parsing for Amount
            if (body.get("amount") != null) {
                billing.setAmount(Double.valueOf(body.get("amount").toString()));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Amount is required");
            }

            billing.setPaymentMethod((String) body.get("paymentMethod"));
            billing.setStatus((String) body.get("status"));
            
            // Date Parsing
            if (body.get("paymentDate") != null) {
                billing.setPaymentDate(LocalDateTime.parse((String) body.get("paymentDate")));
            } else {
                billing.setPaymentDate(LocalDateTime.now());
            }

            // Set Relationship
            billing.setAppointment(appointment);

            // Save
            Billing savedBilling = billingService.createBilling(billing);
            return new ResponseEntity<>(savedBilling, HttpStatus.CREATED);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    // Update Billing
    @PutMapping("/{id}")
    public ResponseEntity<Billing> updateBilling(@PathVariable("id") Long billId, @RequestBody Billing billingDetails) {
        Billing updatedBilling = billingService.updateBilling(billId, billingDetails);
        
        if (updatedBilling != null) {
            return new ResponseEntity<>(updatedBilling, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete Billing
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteBilling(@PathVariable("id") Long billId) {
        try {
            if (billingService.billingExists(billId)) {
                billingService.deleteBilling(billId); 
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}