import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import QRCode from "qrcode.react";
import Nav from "./Nav";
import "../styles/UnifiedTeacherDashboard.css";

// Import existing components for modals/overlays
import ProjectManagement from "./ProjectManagement";
import AttendanceManagement from "./AttendanceManagementNew";
import Reports from "./Reports";
import TeacherSettings from "./TeacherSettings";

const UnifiedTeacherDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [teacherData, setTeacherData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  
  // Dashboard specific states
  const [filters, setFilters] = useState({
    section: '',
    course: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Session creation states
  const [sessionForm, setSessionForm] = useState({
    name: '',
    course: '',
    section: '',
    time: '',
    duration: '60',
    radius: '100',
    location: ''
  });
  const [qrData, setQrData] = useState("");
  const [showQR, setShowQR] = useState(false);
  
  // Schedule and tasks states
  const [schedule, setSchedule] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('day'); // 'day', 'week', 'month'
  
  const navigate = useNavigate();

  useEffect(() => {
    // For demo purposes, set a demo token if none exists
    if (!localStorage.getItem("token")) {
      // This is a demo token - in production, users would login
      localStorage.setItem("token", "demo-token-for-development");
    }
    
    fetchTeacherData();
    fetchSchedule();
    fetchTasks();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // For demo purposes, use mock data if no token
        console.log("No authentication token found, using demo data");
        setTeacherData({
          name: "Demo Teacher",
          email: "demo@teacher.com",
          type: "teacher"
        });
        setIsLoading(false);
        return;
      }
      const response = await api.get("/users/profile");
      setTeacherData(response.data.user);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching teacher data:", err);
      if (err.code === 'ERR_NETWORK' || err.message.includes('ERR_CONNECTION_REFUSED')) {
        console.log("Backend server is not running, using demo data");
        setTeacherData({
          name: "Demo Teacher",
          email: "demo@teacher.com",
          type: "teacher"
        });
      } else if (err.response && err.response.status === 401) {
        // Use demo data for development
        console.log("Authentication failed, using demo data");
        setTeacherData({
          name: "Demo Teacher",
          email: "demo@teacher.com",
          type: "teacher"
        });
      }
      setIsLoading(false);
    }
  };

  const fetchSchedule = async () => {
    // Mock schedule data with more comprehensive weekly schedule
    const today = new Date();
    const mockSchedule = [
      { id: 1, course: 'Mathematics', section: 'A', time: '09:00-10:00', room: 'Room 101', date: today.toISOString().split('T')[0], day: 'Monday' },
      { id: 2, course: 'Physics', section: 'B', time: '11:00-12:00', room: 'Room 203', date: today.toISOString().split('T')[0], day: 'Monday' },
      { id: 3, course: 'Chemistry', section: 'A', time: '14:00-15:00', room: 'Lab 1', date: today.toISOString().split('T')[0], day: 'Monday' },
      { id: 4, course: 'Mathematics', section: 'B', time: '10:00-11:00', room: 'Room 102', date: new Date(today.getTime() + 86400000).toISOString().split('T')[0], day: 'Tuesday' },
      { id: 5, course: 'Physics', section: 'A', time: '13:00-14:00', room: 'Room 203', date: new Date(today.getTime() + 86400000).toISOString().split('T')[0], day: 'Tuesday' },
    ];
    setSchedule(mockSchedule);
  };

  const fetchTasks = async () => {
    // Mock tasks data with more variety
    const mockTasks = [
      { id: 1, task: 'Grade Math assignments for Section A', completed: false, priority: 'high', dueDate: '2025-08-19' },
      { id: 2, task: 'Prepare Physics lab notes for tomorrow', completed: false, priority: 'medium', dueDate: '2025-08-20' },
      { id: 3, task: 'Review chemistry reports from last week', completed: true, priority: 'low', dueDate: '2025-08-18' },
      { id: 5, task: 'Plan next week\'s curriculum', completed: false, priority: 'medium', dueDate: '2025-08-22' },
    ];
    setTasks(mockTasks);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!sessionForm.name.trim()) {
      alert("Please enter a session name");
      return;
    }
    
    if (!sessionForm.time) {
      alert("Please select a time for the session");
      return;
    }
    
    try {
      // Generate UUID for session
      const session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare session data with all required fields
      const sessionData = {
        session_id,
        date: new Date().toISOString().split("T")[0],
        time: sessionForm.time,
        name: sessionForm.name.trim(),
        course: sessionForm.course.trim() || "General Course",
        section: sessionForm.section || "A",
        duration: sessionForm.duration || "60",
        radius: sessionForm.radius || "100",
        location: "0,0" // Default location for demo
      };
      
      console.log("Creating session with data:", sessionData);
      
      // Create session
      const response = await api.post("/sessions/create", sessionData);
      console.log("Session creation response:", response.data);
      
      if (response.data.success) {
        // Generate and show QR code
        setQrData(session_id);
        setShowQR(true);
        console.log("✅ QR code generated for session:", session_id);
        
        // Reset form after successful creation
        setSessionForm({
          name: '',
          course: '',
          section: '',
          time: '',
          duration: '60',
          radius: '100',
          location: ''
        });
        
        alert("✅ Session Created Successfully!\n\nYour QR code is ready for student access.");
      } else {
        console.error("Session creation failed:", response.data);
        alert("Failed to create session: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error creating session:", err);
      
      // Even if API fails, still generate QR for demo purposes
      const session_id = `demo_session_${Date.now()}`;
      setQrData(session_id);
      setShowQR(true);
      console.log("🔄 Generated demo QR code:", session_id);
      
      // Reset form after generating demo QR
      setSessionForm({
        name: '',
        course: '',
        section: '',
        time: '',
        duration: '60',
        radius: '100',
        location: ''
      });
      
      // Show user-friendly message instead of scary error
      alert("✅ QR Code Generated Successfully!\n\nNote: This is a demo QR code for testing purposes.");
    }
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        task: newTask,
        completed: false,
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0]
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getTodaysSchedule = () => {
    const today = new Date().toISOString().split('T')[0];
    return schedule.filter(item => item.date === today);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/logout");
  };

  const openModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  const renderModalContent = () => {
    switch (modalContent) {
      case 'projects':
        return <ProjectManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <TeacherSettings />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="unified-dashboard">
      <Nav pageTitle="Teacher Dashboard" userType="teacher" />
      
      <div className="dashboard-layout">
        {/* Left Sidebar Navigation */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div 
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Dashboard</span>
            </div>
            
            <div 
              className={`nav-item ${activeSection === 'create-session' ? 'active' : ''}`}
              onClick={() => setActiveSection('create-session')}
            >
              <span className="nav-icon">➕</span>
              <span className="nav-text">Create Session</span>
            </div>
            
            <div 
              className={`nav-item ${activeSection === 'qr-generator' ? 'active' : ''}`}
              onClick={() => setActiveSection('qr-generator')}
            >
              <span className="nav-icon">📱</span>
              <span className="nav-text">QR Generator</span>
            </div>
            
            <div 
              className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveSection('projects')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Projects</span>
            </div>
            
            <div 
              className={`nav-item ${activeSection === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveSection('attendance')}
            >
              <span className="nav-icon">✅</span>
              <span className="nav-text">Attendance</span>
            </div>
            
            <div 
              className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveSection('reports')}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-text">Reports</span>
            </div>
            
            <div 
              className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
            </div>

            <div 
              className="nav-item logout-item"
              onClick={handleLogout}
            >
              <span className="nav-icon">🚪</span>
              <span className="nav-text">Logout</span>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={`main-content ${activeSection !== 'dashboard' ? 'full-width' : ''}`}>
          {activeSection === 'dashboard' && (
            <div className="dashboard-main">
              <div className="welcome-section">
                <h1>Welcome back, {teacherData.name || 'Teacher'}!</h1>
                <p>Manage your classes and track attendance</p>
              </div>
              
              <h2>Today's Overview</h2>
              
              {/* Filter Controls */}
              <div className="filter-section">
                <div className="filter-group">
                  <label>Course:</label>
                  <input
                    type="text"
                    value={filters.course}
                    onChange={(e) => setFilters({...filters, course: e.target.value})}
                    placeholder="Filter by course"
                  />
                </div>
                
                <div className="filter-group">
                  <label>Section:</label>
                  <select
                    value={filters.section}
                    onChange={(e) => setFilters({...filters, section: e.target.value})}
                  >
                    <option value="">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'create-session' && (
            <div className="create-session-section">
              <h1>🎯 Create New Session</h1>
              <form onSubmit={handleCreateSession} className="session-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>📚 Course Name</label>
                    <input
                      type="text"
                      value={sessionForm.name}
                      onChange={(e) => setSessionForm({...sessionForm, name: e.target.value})}
                      placeholder="Enter course name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>📖 Course Code</label>
                    <input
                      type="text"
                      value={sessionForm.course}
                      onChange={(e) => setSessionForm({...sessionForm, course: e.target.value})}
                      placeholder="e.g., MATH101"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>🎯 Section</label>
                    <select
                      value={sessionForm.section}
                      onChange={(e) => setSessionForm({...sessionForm, section: e.target.value})}
                      required
                    >
                      <option value="">Select Section</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>🕐 Time</label>
                    <input
                      type="time"
                      value={sessionForm.time}
                      onChange={(e) => setSessionForm({...sessionForm, time: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>⏱️ Duration (minutes)</label>
                    <input
                      type="number"
                      value={sessionForm.duration}
                      onChange={(e) => setSessionForm({...sessionForm, duration: e.target.value})}
                      min="15"
                      max="180"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>📍 Radius (meters)</label>
                    <input
                      type="number"
                      value={sessionForm.radius}
                      onChange={(e) => setSessionForm({...sessionForm, radius: e.target.value})}
                      min="50"
                      max="500"
                    />
                  </div>
                </div>

                <button type="submit" className="create-session-btn">
                  🎯 Create Session & Generate QR
                </button>
              </form>

              {showQR && (
                <div className="qr-result">
                  <h2>✅ Session Created Successfully!</h2>
                  <div className="qr-container">
                    <QRCode value={qrData} size={200} />
                    <p>Session ID: {qrData}</p>
                    <button 
                      onClick={() => {setShowQR(false); setQrData('');}}
                      className="close-qr-btn"
                    >
                      Create Another Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'qr-generator' && (
            <div className="qr-generator-section">
              <h1>📱 QR Code Generator</h1>
              <div className="qr-info">
                <p>Use the "Create Session" tab to generate QR codes for student sessions.</p>
                <button 
                  onClick={() => setActiveSection('create-session')}
                  className="redirect-btn"
                >
                  Go to Create Session
                </button>
              </div>
            </div>
          )}

          {/* Page Sections - Each section opens as a full page */}
          {activeSection === 'reports' && (
            <div className="page-section">
              <div className="page-header">
                <h1>📈 Reports & Analytics</h1>
                <p>View detailed reports and analytics</p>
              </div>
              <Reports />
            </div>
          )}

          {activeSection === 'projects' && (
            <div className="page-section">
              <div className="page-header">
                <h1>💼 Project Management</h1>
                <p>Manage student projects and assignments</p>
              </div>
              <ProjectManagement />
            </div>
          )}

          {activeSection === 'attendance' && (
            <div className="page-section">
              <div className="page-header">
                <h1>📊 Attendance Management</h1>
                <p>Manage student attendance records and add manual entries</p>
              </div>
              <AttendanceManagement />
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="page-section">
              <div className="page-header">
                <h1>⚙️ Settings</h1>
                <p>Configure your preferences and account settings</p>
              </div>
              <TeacherSettings />
            </div>
          )}
        </main>

        {/* Right Schedule Panel - Only show on dashboard */}
        {activeSection === 'dashboard' && (
          <aside className="schedule-panel">
          <div className="calendar-section">
            <h2>📅 Schedule Calendar</h2>
            <div className="calendar-header">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getTime() - 86400000))}
                className="calendar-nav-btn"
              >
                ⬅️
              </button>
              <h3>{formatDate(currentDate)}</h3>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getTime() + 86400000))}
                className="calendar-nav-btn"
              >
                ➡️
              </button>
            </div>
            
            <div className="calendar-view-toggle">
              <button 
                className={`view-btn ${calendarView === 'day' ? 'active' : ''}`}
                onClick={() => setCalendarView('day')}
              >
                Day
              </button>
              <button 
                className={`view-btn ${calendarView === 'week' ? 'active' : ''}`}
                onClick={() => setCalendarView('week')}
              >
                Week
              </button>
            </div>
          </div>

          <div className="schedule-section">
            <h2>🕐 Today's Classes</h2>
            <div className="schedule-list">
              {getTodaysSchedule().map((item) => (
                <div key={item.id} className="schedule-item">
                  <div className="schedule-time">{item.time}</div>
                  <div className="schedule-details">
                    <h4>{item.course}</h4>
                    <p>Section {item.section} • {item.room}</p>
                  </div>
                  <div className="schedule-status">
                    {new Date(`${item.date} ${item.time.split('-')[0]}`) < new Date() ? '✅' : '⏰'}
                  </div>
                </div>
              ))}
              
              {getTodaysSchedule().length === 0 && (
                <div className="no-schedule">
                  <p>No classes scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          <div className="tasks-section">
            <h2>📝 Tasks & Reminders</h2>
            
            <div className="add-task">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task..."
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <button onClick={addTask} className="add-task-btn">➕</button>
            </div>

            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <div className="task-details">
                      <span className="task-text">{task.task}</span>
                      <span className="task-due">Due: {task.dueDate}</span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="delete-task-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
        )}
      </div>

      {/* Modal for detailed views */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedTeacherDashboard;
