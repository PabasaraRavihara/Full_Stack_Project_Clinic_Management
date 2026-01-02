package com.example.Clinic_Management_System.repository;
import com.example.Clinic_Management_System.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicalRecordRepositary extends JpaRepository<MedicalRecord,Long>{
}
