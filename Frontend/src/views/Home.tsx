import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, SignInIcon, BellIcon } from '../components/Icons.tsx';
import api from '../api/axios.Config.ts'; 
import logo from '../assets/logo.png';

// --- Interfaces ---
interface Doctor {
  id: number;
  name: string;
  specialization: string;
  email: string;
  phone: string;
}

interface Appointment {
  id: number;
  date: string; // Format: "YYYY-MM-DD"
  time: string;
  status: string;
  doctor?: Doctor; 
  patient?: { id: number; firstName: string; lastName: string };
}

const Home = () => {
  const navigate = useNavigate();
  
  // User State
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Data State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- CALENDAR STATE ---
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState<string | null>(null); 
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Navigation State
  const [activeSection, setActiveSection] = useState('hero');

  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // --- 1. INSTANT AUTH CHECK ---
  useEffect(() => {
    const checkAuth = () => {
      try {
        const adminData = localStorage.getItem('adminData');
        const doctorData = localStorage.getItem('doctorData');
        const patientData = localStorage.getItem('patientData');

        if (patientData) {
          const p = JSON.parse(patientData);
          setUserName(p.firstName);
          setUserRole('patient');
          setUserId(p.id);
        } else if (doctorData) {
          const d = JSON.parse(doctorData);
          setUserName(d.name ? d.name.replace(/^Dr\.?\s*/i, '').split(' ')[0] : 'Doctor');
          setUserRole('doctor');
        } else if (adminData) {
          const a = JSON.parse(adminData);
          setUserName(a.name ? a.name.split(' ')[0] : 'Admin');
          setUserRole('admin');
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
        localStorage.clear();
      }
    };
    checkAuth();
  }, []);

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      
      // A. Fetch Doctors (Public Info)
      try {
        const doctorsRes = await api.get('/doctors');
        setDoctors(doctorsRes.data); 
      } catch (e) { console.error("Could not fetch doctors."); }

      // B. Fetch Appointments (Only if Patient is logged in)
      if (userRole === 'patient' && userId) {
        try {
          const appRes = await api.get('/appointments');
          const userApps = appRes.data.filter((a: any) => a.patient && a.patient.id === userId);
          setMyAppointments(userApps);
          
          if (userApps.length > 0) {
             const nextAppt = userApps[0]; 
             setSelectedDate(nextAppt.date);
             setSelectedAppointment(nextAppt);
          }
        } catch (e) { console.error("Could not fetch appointments"); }
      }
      setIsLoading(false);
    };
    fetchHomeData();
  }, [userRole, userId]); 

  // --- 3. GENERATE NOTIFICATIONS (Logic) ---
  useEffect(() => {
    if (userRole === 'patient') {
       const newNotifs: string[] = [];

       // 1. Rejected Appointments
       myAppointments.forEach(a => {
           if (a.status === 'REJECTED') {
               newNotifs.push(`⚠️ Your appointment with Dr. ${a.doctor?.name || 'Unknown'} on ${a.date} was rejected.`);
           }
       });

       // 2. Upcoming Appointments (Within 3 days)
       const today = new Date();
       const threeDaysLater = new Date();
       threeDaysLater.setDate(today.getDate() + 3);

       myAppointments.forEach(a => {
           const apptDate = new Date(a.date);
           if (a.status !== 'REJECTED' && apptDate >= today && apptDate <= threeDaysLater) {
               newNotifs.push(`📅 Reminder: You have an appointment with Dr. ${a.doctor?.name || 'Assigned'} on ${a.date} at ${a.time}.`);
           }
       });

       // 3. New Doctor Added (Find newest by ID)
       if (doctors.length > 0) {
           // Sort a copy of the array by ID descending to find the newest
           const sortedDocs = [...doctors].sort((a, b) => b.id - a.id);
           const newestDoc = sortedDocs[0]; 
           newNotifs.push(`👨‍⚕️ New Doctor Available: Dr. ${newestDoc.name} (${newestDoc.specialization}) has joined the clinic!`);
       }

       setNotifications(newNotifs);
    }
  }, [userRole, myAppointments, doctors]);

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; 
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    setSelectedDate(dateStr);
    
    const appt = myAppointments.find(a => a.date === dateStr);
    setSelectedAppointment(appt || null);
  };

  const changeMonth = (offset: number) => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const hasAppointment = myAppointments.some(a => a.date === dateStr);
        const isSelected = selectedDate === dateStr;

        days.push(
            <div 
                key={day} 
                className={`calendar-day ${hasAppointment ? 'has-appt' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDateClick(day)}
            >
                {day}
                {hasAppointment && <span className="appt-dot"></span>}
            </div>
        );
    }
    return days;
  };

  // --- SCROLL ANIMATION OBSERVER ---
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const timeoutId = setTimeout(() => {
      const hiddenElements = document.querySelectorAll('.reveal-on-scroll');
      hiddenElements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [doctors, myAppointments, isLoading]); 

  // --- ACTIVE SECTION OBSERVER ---
  useEffect(() => {
    const sectionIds = ['hero', 'appointments', 'doctors', 'about', 'contact'];
    const sections = sectionIds.map(id => document.getElementById(id));
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { threshold: 0.2, rootMargin: "-10% 0px -50% 0px" });
    
    sections.forEach(s => s && navObserver.observe(s));
    return () => navObserver.disconnect();
  }, []);

  // --- Handlers ---
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserName(null);
    setUserRole(null);
    setUserId(null);
    setMyAppointments([]);
    navigate('/patient-login');
  };

  const handleMyHealthClick = () => {
    if (localStorage.getItem('patientData')) { navigate('/patient-dashboard'); return; }
    if (localStorage.getItem('doctorData')) { navigate('/doctor-dashboard'); return; }
    if (localStorage.getItem('adminData')) { navigate('/admin-dashboard'); return; }
    navigate('/patient-login');
  };

  const getNavStyle = (sectionId: string) => activeSection === sectionId ? { fontWeight: 'bold', color: '#0056b3' } : {};
// --- Render Helper for Doctor Card ---
  const renderDoctorCard = (doc: Doctor, key: string | number) => (
    <div key={key} className="doctor-card" style={{minWidth: '300px'}}>
      <div className="doc-avatar">👨‍⚕️</div>
      <h3 style={{color: '#333 !important'}}>
        Dr. {doc.name.replace(/^Dr\.?\s*/i, '')}
      </h3>
      <p style={{color: '#0056b3 !important', fontWeight: '500'}}>{doc.specialization}</p>
      <p style={{fontSize: '0.9rem', color: '#666 !important'}}>{doc.email}</p>
      <button onClick={handleMyHealthClick}>View Profile</button>
    </div>
  );
  return (
    <div className="home-container">
      
      {/* --- HEADER --- */}
      <header className="home-header">
        <div className="header-logo">
          <img src={logo} alt="Logo" className="header-logo-img" />
          <h1><b>Health Care+</b></h1>
        </div>
        <nav className="header-nav">
          <button onClick={() => scrollToSection('hero')} style={getNavStyle('hero')}>Home</button>
          <button onClick={handleMyHealthClick}>My Health</button>
          <button onClick={() => scrollToSection('appointments')} style={getNavStyle('appointments')}>Appointments</button>
          <button onClick={() => scrollToSection('doctors')} style={getNavStyle('doctors')}>Doctors</button>
          <button onClick={() => scrollToSection('about')} style={getNavStyle('about')}>About Us</button>
          <button onClick={() => scrollToSection('contact')} style={getNavStyle('contact')}>Contact Us</button>
        </nav>
        <div className="header-user">
          {userName ? (
            <div className="user-profile-badge">
              
              {/* --- NOTIFICATION BELL --- */}
              {userRole === 'patient' && (
                  <div className="notification-container" onClick={() => setShowNotifications(!showNotifications)}>
                      <BellIcon />
                      {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
                      {showNotifications && (
                          <div className="notification-dropdown">
                              <div className="notification-header">Notifications</div>
                              <div className="notification-list">
                                  {notifications.length > 0 ? (
                                      notifications.map((note, index) => (
                                          <div key={index} className="notification-item">{note}</div>
                                      ))
                                  ) : (
                                      <div className="notification-empty">No new notifications</div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
              )}

              <span className="welcome-text">Hi, {userName}</span>
              <div className="avatar-circle" onClick={handleMyHealthClick} title="Go to Dashboard"><UserIcon /></div>
              <button onClick={handleLogout} className="logout-link" title="Logout"><SignInIcon /></button>
            </div>
          ) : (
            <button className="header-signin-btn" onClick={() => navigate('/patient-login')}>Sign In</button>
          )}
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section id="hero" className="hero-section">
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="/hero-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay">
          <div className="hero-content reveal-on-scroll">
            <h1>Your Health, Our Priority</h1>
            <p>Experience seamless healthcare with HealthCare+. Get quality medicines, expert consultations, and reliable services delivered to your life.</p>
            <div className="hero-buttons">
              <button className="primary-btn" onClick={handleMyHealthClick}>Book Appointment</button>
              <button className="secondary-btn" onClick={() => scrollToSection('about')}>Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- APPOINTMENTS SECTION --- */}
      <section id="appointments" className="bg-section" style={{backgroundImage: 'url(/home2.jpg)', backgroundColor: '#023e8a'}}> 
        <div className="bg-overlay">
          <div className="section-container reveal-on-scroll">
            <h2>{userRole === 'patient' ? 'Your Upcoming Appointments' : 'Easy Appointments'}</h2>
            <p>{userRole === 'patient' ? 'Check your schedule and manage your visits.' : 'Book your consultation with top specialists in just a few clicks.'}</p>

            {userRole === 'patient' ? (
                <div className="appointments-layout">
                    {/* CALENDAR */}
                    <div className="calendar-card">
                        <div className="calendar-header">
                            <button onClick={() => changeMonth(-1)}>&lt;</button>
                            <span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                            <button onClick={() => changeMonth(1)}>&gt;</button>
                        </div>
                        <div className="calendar-days-header">
                            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                        </div>
                        <div className="calendar-grid">
                            {renderCalendar()}
                        </div>
                    </div>

                    {/* DETAILS CARD */}
                    <div className="appointment-details-wrapper">
                        {selectedAppointment ? (
                            <div className="feature-card appointment-detail-card">
                                <div className="detail-header">
                                    <h3>{selectedAppointment.date}</h3>
                                    <span className="detail-time">{selectedAppointment.time}</span>
                                </div>
                                <div className="detail-body">
                                    <p className="doc-name">Dr. {selectedAppointment.doctor?.name || 'Assigned Doctor'}</p>
                                    <p className="specialization">{selectedAppointment.doctor?.specialization || 'General'}</p>
                                    <div className={`status-badge ${selectedAppointment.status.toLowerCase()}`}>
                                        {selectedAppointment.status}
                                    </div>
                                    <button className="view-btn" onClick={() => navigate('/patient-dashboard')}>
                                        Manage Booking
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="feature-card empty-detail-card">
                                <h3>No Appointment Selected</h3>
                                <p>Select a highlighted date on the calendar to view details.</p>
                                {selectedDate && <p className="selected-date-hint">Selected: {selectedDate}</p>}
                                <button className="primary-btn" onClick={() => navigate('/patient-dashboard')}>
                                    Book New Appointment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="cards-grid">
                  <div className="feature-card"><h3 style={{color: '#333 !important'}}>Find a Doctor</h3><p style={{color: '#666 !important'}}>Search by specialization.</p></div>
                  <div className="feature-card"><h3 style={{color: '#333 !important'}}>Select Time</h3><p style={{color: '#666 !important'}}>Choose a convenient time.</p></div>
                  <div className="feature-card"><h3 style={{color: '#333 !important'}}>Get Confirmed</h3><p style={{color: '#666 !important'}}>Receive instant confirmation.</p></div>
                </div>
            )}
          </div>
        </div>
      </section>

      {/* --- DOCTORS SECTION --- */}
      <section id="doctors" className="bg-section" style={{backgroundImage: 'url(/home3.jpg)', backgroundColor: '#023e8a'}}>
        <div className="bg-overlay">
          <div className="section-container reveal-on-scroll">
            <h2>Our Specialists</h2>
            <p>Meet our team of experienced medical professionals ready to assist you.</p>
            
            {/* Logic for Scrolling vs Grid */}
            {isLoading && doctors.length === 0 ? (
                <p>Loading Specialists...</p>
            ) : doctors.length > 3 ? (
                // --- SCROLLING BANNER (>3 Doctors) ---
                <div className="scrolling-wrapper">
                    <div className="scrolling-track">
                        {/* Duplicate list to create seamless loop */}
                        {[...doctors, ...doctors].map((doc, index) => 
                            renderDoctorCard(doc, `${doc.id}-scroll-${index}`)
                        )}
                    </div>
                </div>
            ) : (
                // --- STATIC GRID (<=3 Doctors) ---
                <div className="cards-grid">
                    {doctors.length > 0 ? doctors.map((doc) => 
                        renderDoctorCard(doc, doc.id)
                    ) : <p>No doctors available at the moment.</p>}
                </div>
            )}
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="content-section">
        <div className="section-container reveal-on-scroll">
          <h2>About Health Care+</h2>
          <div className="about-content" style={{maxWidth: '800px', margin: '0 auto'}}>
            <p>HealthCare+ is dedicated to providing accessible, high-quality medical services to everyone. 
              Founded in 2025, we bridge the gap between patients and doctors through technology.
              Our platform simplifies the process of finding specialists, booking appointments, and managing medical records securely.</p>
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="content-section footer-section">
        <div className="section-container reveal-on-scroll">
          <h2 style={{color: 'white'}}>Contact Us</h2>
          <div className="contact-grid">
            <div className="contact-item"><h4>Email</h4><p style={{color: '#9ca3af'}}>clinicmanagementsystem3@gmail.com</p></div>
            <div className="contact-item"><h4>Phone</h4><p style={{color: '#9ca3af'}}>+94 11 234 5678</p></div>
            <div className="contact-item"><h4>Address</h4><p style={{color: '#9ca3af'}}>Kandy road, Dalugama, Kelaniya.</p></div>
          </div>
          <div className="footer-copy">&copy; 2025 Health Care+. All rights reserved.</div>
        </div>
      </section>

    </div>
  );
};

export default Home;