package com.example.Clinic_Management_System.service.impl;

import com.example.Clinic_Management_System.model.MedicalRecord;
import com.example.Clinic_Management_System.repository.MedicalRecordRepositary;
import com.example.Clinic_Management_System.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordServiceImpl implements MedicalRecordService {

    @Autowired
    private MedicalRecordRepositary medicalRecordRepository;

    @Override
    public List<MedicalRecord> getAllRecords() {
        return medicalRecordRepository.findAll();
    }

    @Override
    public Optional<MedicalRecord> getRecordById(Long id) {
        return medicalRecordRepository.findById(id);
    }

    @Override
    public MedicalRecord createRecord(MedicalRecord record) {
        return medicalRecordRepository.save(record);
    }

    @Override
    public MedicalRecord updateRecord(Long id, MedicalRecord updatedRecord) {
        MedicalRecord existingRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical Record not found with id: " + id));

        existingRecord.setDiagnosis(updatedRecord.getDiagnosis());
        existingRecord.setTreatment(updatedRecord.getTreatment());
        existingRecord.setNotes(updatedRecord.getNotes());
        existingRecord.setRecordDate(updatedRecord.getRecordDate());
        existingRecord.setPatient(updatedRecord.getPatient());
        existingRecord.setDoctor(updatedRecord.getDoctor());

        return medicalRecordRepository.save(existingRecord);
    }

    @Override
    public void deleteRecord(Long id) {
        medicalRecordRepository.deleteById(id);
    }
}
