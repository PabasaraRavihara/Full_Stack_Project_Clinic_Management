package com.example.Clinic_Management_System.repository;

import com.example.Clinic_Management_System.model.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingRepository extends JpaRepository<Billing, Long> {

    // Now these will work because appointmentId is a direct field
    List<Billing> findByAppointmentId(Long appointmentId);
    List<Billing> findByStatus(String status);
    Optional<Billing> findByAppointmentIdAndStatus(Long appointmentId, String status);
    boolean existsByAppointmentId(Long appointmentId);
}