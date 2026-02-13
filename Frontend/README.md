# 🏥 HealthCare+ Clinic Management System (Frontend) #

**HealthCare+** is a modern, responsive and interactive frontend application for managing clinic operations. Built with **React**, **TypeScript**  and **Vite**, it features role-based dashboards for **Patients**, **Doctors**  and **Administrators**, enhanced with advanced animations and **Glassmorphism UI design**.

---

## 🚀 Key Features & Services

### 🎨 User Interface & Experience

- **Glassmorphism Design**
  - Semi-transparent UI elements
  - Blur effects for a sleek, futuristic appearance

- **Smooth Animations**
  - “Breath” entry animations for login screens
  - Horizontal & vertical sliding transitions between dashboard tabs
  - Parallax scrolling effects on the Home page
  - Pop-in scroll reveal animations for content sections

- **Interactive Home Page**
  - Video background Hero section with blur and fade-in effects
  - Infinite scrolling banner showcasing the doctor team
  - Integrated public appointment booking calendar

---

## 🏥 Role-Based Dashboards

### 👤 Patient Dashboard

- **Secure Login & Registration**
- **Appointment Management**
  - View upcoming and past appointments
  - Book appointments with specific doctors
  - Interactive calendar with 15-minute time slots
- **Medical Records**
  - View diagnosis and treatment history
- **Notification Center**
  - Real-time appointment updates (accept/reject)
  - Notifications for new doctor arrivals
- **Profile**
  - View personal details

---

### 👨‍⚕️ Doctor Dashboard

- **Patient Management**
  - View assigned patients
- **Appointment Control**
  - Accept or reject patient appointment requests
- **Medical Records**
  - Create and update diagnosis, treatment, and notes
- **Billing System**
  - Generate invoices and track payment status
- **Statistics Overview**
  - Total patients
  - Today’s appointments
  - Income summary

---

### 🛡️ Admin Dashboard

- **Doctor Management**
  - Add new doctors with complete details
- **Patient Directory**
  - View all registered patients
- **System Overview**
  - Monitor appointments, doctors on duty, and clinic activity
  - Dashboard statistics cards

---

## 🛠️ Tech Stack

### Frontend Framework
- **React (v18+)** – Component-based UI
- **TypeScript** – Strong typing for safer code
- **Vite** – Fast development and build tool

### Styling & UI
- **Custom CSS**
  - Glassmorphism effects
  - Keyframe animations (slides, fades, scrolling)
- **Flexbox & Grid**
  - Responsive layouts
- **Bootstrap**
  - Responsive forms, buttons, and grid components

### Routing & State
- **React Router DOM (v6)** – Client-side routing
- **React Hooks**
  - `useState`
  - `useEffect`
  - `useNavigate`

### API & Data
- **Axios**
  - Promise-based HTTP client
- **Interceptor Pattern**
  - Centralized Axios instance for JWT/Auth token injection

---

## 📂 Project Structure

```text
src/
├── api/
│   └── axios.Config.ts      # Centralized Axios instance with Token Interceptors
├── assets/
│   ├── loginimage.jpg       # Backgrounds
│   ├── logo.png             # Branding
│   └── ...                  # Icons and illustrations
├── components/
│   └── Icons.tsx            # Reusable SVG Icons
├── types/
│   └── types.ts             # TypeScript interfaces
├── views/
│   ├── AdminDashboard.tsx
│   ├── AdminLogIn.tsx
│   ├── DoctorDashboard.tsx
│   ├── DoctorLogin.tsx
│   ├── Home.tsx
│   ├── PatientDashboard.tsx
│   ├── PatientSignIn.tsx
│   └── PatientSignUp.tsx
├── App.tsx                  # Routing & Auth Wrapper
├── App.css                  # Global Styles & Animations
└── main.tsx                 # Entry Point
```
---
### ⚙️ Installation & Setup
### 1️⃣ Clone the Repository
```bash
git clone https://github.com/RK17904/clinic-management-system-frontend.git
cd clinic-management-system-frontend
```
### 2️⃣ Install Dependencies
```bash
npm install
```
### 3️⃣ Configure the API
#### Ensure your backend is running.
#### Edit src/api/axios.Config.ts
```bash
const api = axios.create({
  baseURL: 'http://localhost:8083/api', // Update port if needed
});
```
### 4️⃣ Run the Development Server
```bash
npm run dev
```
### 5️⃣ Open in Browser
#### Navigate to:
```bash
http://localhost:5173
```
---
## 🤝 Contributing
#### 1.Fork the project
#### 2.Create your feature branch
#### 3.Commit your changes
#### 4.Push to the branch
#### 5.Open a Pull Request
```bash
git checkout -b feature/AmazingFeature
git commit -m "Add AmazingFeature"
git push origin feature/AmazingFeature
```
---
## Developed by ❤️ Health Care+ Team
----

