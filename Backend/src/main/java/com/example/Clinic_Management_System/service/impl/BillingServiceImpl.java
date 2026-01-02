package com.example.Clinic_Management_System.service.impl;

import com.example.Clinic_Management_System.model.Billing;
import com.example.Clinic_Management_System.repository.BillingRepository;
import com.example.Clinic_Management_System.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BillingServiceImpl implements BillingService {

    @Autowired
    private BillingRepository billingRepository;

    @Override
    public List<Billing> getAllBillings() {
        return billingRepository.findAll();
    }

    @Override
    public Optional<Billing> getBillingById(Long billId) {
        return billingRepository.findById(billId);
    }

    @Override
    public List<Billing> getBillingsByAppointmentId(Long appointmentId) {
        return billingRepository.findByAppointmentId(appointmentId); // Updated
    }

    @Override
    public List<Billing> getBillingsByStatus(String status) {
        return billingRepository.findByStatus(status);
    }

    @Override
    public Billing createBilling(Billing billing) {
        return billingRepository.save(billing);
    }

    @Override
    public Billing updateBilling(Long billId, Billing billingDetails) {
        Optional<Billing> optionalBilling = billingRepository.findById(billId);
        if (optionalBilling.isPresent()) {
            Billing existingBilling = optionalBilling.get();
            existingBilling.setAppointment(billingDetails.getAppointment());
            existingBilling.setAmount(billingDetails.getAmount());
            existingBilling.setPaymentMethod(billingDetails.getPaymentMethod());
            existingBilling.setPaymentDate(billingDetails.getPaymentDate());
            existingBilling.setStatus(billingDetails.getStatus());
            return billingRepository.save(existingBilling);
        }
        return null;
    }

    @Override
    public void deleteBilling(Long billId) {
        billingRepository.deleteById(billId);
    }

    @Override
    public boolean billingExists(Long billId) {
        return billingRepository.existsById(billId);
    }

    @Override
    public boolean appointmentHasBilling(Long appointmentId) {
        return billingRepository.existsByAppointmentId(appointmentId); // Updated
    }

    @Override
    public Optional<Billing> getBillingByAppointmentAndStatus(Long appointmentId, String status) {
        return billingRepository.findByAppointmentIdAndStatus(appointmentId, status); // Updated
    }
}