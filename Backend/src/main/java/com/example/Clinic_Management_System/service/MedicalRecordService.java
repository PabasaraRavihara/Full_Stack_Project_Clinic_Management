package com.example.Clinic_Management_System.service;
import com.example.Clinic_Management_System.model.MedicalRecord;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
public interface MedicalRecordService {
    List<MedicalRecord> getAllRecords();
    Optional<MedicalRecord> getRecordById(Long id);
    MedicalRecord createRecord(MedicalRecord record);
    MedicalRecord updateRecord(Long id, MedicalRecord record);
    void deleteRecord(Long id);
}
