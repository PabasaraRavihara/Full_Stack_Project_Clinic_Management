package com.example.Clinic_Management_System.service;

import com.example.Clinic_Management_System.model.Billing;
import java.util.List;
import java.util.Optional;

public interface BillingService {
    List<Billing> getAllBillings();
    Optional<Billing> getBillingById(Long billId);
    List<Billing> getBillingsByAppointmentId(Long appointmentId); // Updated method name
    List<Billing> getBillingsByStatus(String status);
    Billing createBilling(Billing billing);
    Billing updateBilling(Long billId, Billing billingDetails);
    void deleteBilling(Long billId);
    boolean billingExists(Long billId);
    boolean appointmentHasBilling(Long appointmentId); // Updated method name
    Optional<Billing> getBillingByAppointmentAndStatus(Long appointmentId, String status);
}