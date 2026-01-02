# Clinic Management System

A comprehensive web application for managing clinic operations, including patient registration, appointment scheduling, doctor management, and billing. This system is built using a modern full-stack architecture with **Spring Boot** for the backend and **React (Vite)** for the frontend.

## 🚀 Tech Stack

### Backend
* **Framework:** Spring Boot (Java 17)
* **Database:** MySQL
* **Authentication:** Spring Security with JWT (JSON Web Tokens)
* **Build Tool:** Maven

### Frontend
* **Framework:** React.js
* **Build Tool:** Vite
* **Language:** TypeScript
* **Styling:** CSS / Tailwind (Optional)

### Tools & DevOps
* **API Testing:** Postman
* **Database Management:** MySQL Workbench
* **Containerization:** Docker

---

## ✨ Features

* **User Authentication:** Secure Login/Signup for Admins, Doctors, and Staff using JWT.
* **Patient Management:** Add, update, and view patient details.
* **Doctor Management:** Manage doctor profiles and specializations.
* **Appointment Scheduling:** Book and manage appointments.
* **Medical Records:** Store and retrieve patient medical history.
* **Billing System:** Generate invoices for services.
* **Admin Dashboard:** Centralized control for clinic operations.

---

## 📂 Project Structure

```bash
Clinic-Management-System/
│
├── Backend/                # Spring Boot Application
│   ├── src/main/java/      # Source code (Controllers, Services, Models)
│   ├── Dockerfile          # Docker configuration for Backend
│   └── pom.xml             # Maven dependencies
│
├── Frontend/               # React (Vite) Application
│   ├── src/                # Frontend source code
│   ├── public/             # Static assets
│   ├── vite.config.ts      # Vite configuration
│   └── package.json        # Frontend dependencies
│
└── docker-compose.yml      # Docker Compose file (Optional)
