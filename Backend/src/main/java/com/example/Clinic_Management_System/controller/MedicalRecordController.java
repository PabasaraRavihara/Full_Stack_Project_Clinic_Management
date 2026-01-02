package com.example.Clinic_Management_System.controller;

import com.example.Clinic_Management_System.model.Doctor;
import com.example.Clinic_Management_System.model.MedicalRecord;
import com.example.Clinic_Management_System.model.Patient;
import com.example.Clinic_Management_System.service.DoctorService;
import com.example.Clinic_Management_System.service.MedicalRecordService;
import com.example.Clinic_Management_System.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public List<MedicalRecord> getAllRecords() {
        return medicalRecordService.getAllRecords();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecord> getRecordById(@PathVariable Long id) {
        Optional<MedicalRecord> record = medicalRecordService.getRecordById(id);
        return record.map(ResponseEntity::ok)
                     .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

   
    @PostMapping
    public ResponseEntity<?> createRecord(@RequestBody Map<String, Object> body) {
        try {
            // 1. ID 
            Long patientId = Long.valueOf(body.get("patientId").toString());
            Long doctorId = Long.valueOf(body.get("doctorId").toString());

            // 2. Database  (Names, Email, etc.)
            Patient patient = patientService.findById(patientId).orElse(null);
            Doctor doctor = (Doctor) doctorService.findById(doctorId).orElse(null);

            if (patient == null || doctor == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Patient or Doctor not found");
            }

            // 3. Record 
            MedicalRecord record = new MedicalRecord();
            record.setDiagnosis((String) body.get("diagnosis"));
            record.setTreatment((String) body.get("treatment"));
            record.setNotes((String) body.get("notes"));
            
            if (body.get("recordDate") != null) {
                record.setRecordDate(LocalDate.parse((String) body.get("recordDate")));
            }

            //  Patient/Doctor 
            record.setPatient(patient);
            record.setDoctor(doctor);

            MedicalRecord savedRecord = medicalRecordService.createRecord(record);
            
            // 4. Save 
            return ResponseEntity.status(HttpStatus.CREATED).body(savedRecord);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public MedicalRecord updateRecord(@PathVariable Long id, @RequestBody MedicalRecord record) {
        return medicalRecordService.updateRecord(id, record);
    }

    @DeleteMapping("/{id}")
    public void deleteRecord(@PathVariable Long id) {
        medicalRecordService.deleteRecord(id);
    }
}