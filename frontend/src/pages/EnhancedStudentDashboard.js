import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EnhancedStudentDashboard.css';

const EnhancedStudentDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [studentData, setStudentData] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showScanner, setShowScanner] = useState(false);
  const [scannerSessionId, setScannerSessionId] = useState(null);
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Mock student data
  const mockStudentData = {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@student.edu',
    rollNumber: 'CS001',
    class: 'Computer Science',
    section: 'A',
    profileImage: null
  };

  // Mock courses
  const mockCourses = [
    { id: 1, name: 'Mathematics', code: 'MATH101' },
    { id: 2, name: 'Physics', code: 'PHY201' },
    { id: 3, name: 'Computer Science', code: 'CS301' }
  ];

  // Mock active sessions
  const mockActiveSessions = [
    {
      session_id: 'math-101-001',
      subject: 'Mathematics',
      instructor: 'Dr. Smith',
      date: new Date().toLocaleDateString(),
      time: '10:00 AM - 11:00 AM',
      location: 'Room 201',
      qrCode: 'mock-qr-data',
      status: 'active'
    },
    {
      session_id: 'physics-201-001',
      subject: 'Physics',
      instructor: 'Prof. Johnson',
      date: new Date().toLocaleDateString(),
      time: '2:00 PM - 3:00 PM',
      location: 'Lab 301',
      qrCode: 'mock-qr-data-2',
      status: 'active'
    }
  ];

  // Mock attendance records
  const mockAttendanceRecords = [
    {
      id: 1,
      session_id: 'math-100-001',
      subject: 'Mathematics',
      date: '2025-08-19',
      time: '10:00 AM',
      status: 'Present',
      marked_at: '2025-08-19T10:05:00Z'
    },
    {
      id: 2,
      session_id: 'physics-200-001',
      subject: 'Physics',
      date: '2025-08-18',
      time: '2:00 PM',
      status: 'Present',
      marked_at: '2025-08-18T14:03:00Z'
    },
    {
      id: 3,
      session_id: 'cs-300-001',
      subject: 'Computer Science',
      date: '2025-08-17',
      time: '11:00 AM',
      status: 'Absent',
      marked_at: null
    }
  ];

  useEffect(() => {
    loadStudentData();
    loadActiveSessions();
    loadCourses();
    loadAttendanceRecords();
    
    // Auto-refresh active sessions every 30 seconds
    const interval = setInterval(loadActiveSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Reload attendance when course selection changes
  useEffect(() => {
    loadAttendanceRecords();
  }, [selectedCourse]);

  const loadStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setStudentData(mockStudentData);
        return;
      }
      setStudentData(mockStudentData);
    } catch (error) {
      console.error('Error loading student data:', error);
      setStudentData(mockStudentData);
    }
  };

  const loadActiveSessions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/session/active-sessions');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.sessions.length > 0) {
          setActiveSessions(data.sessions);
        } else {
          // Use mock data if no active sessions
          setActiveSessions(mockActiveSessions);
        }
      } else {
        setActiveSessions(mockActiveSessions);
      }
    } catch (error) {
      console.error('Error loading active sessions:', error);
      setActiveSessions(mockActiveSessions);
    }
  };

  const loadCourses = async () => {
    try {
      setCourses(mockCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses(mockCourses);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      const course = selectedCourse === 'all' ? 'all' : courses.find(c => c.id === parseInt(selectedCourse))?.name || 'all';
      const response = await fetch(`http://localhost:5000/api/session/student-attendance?course=${course}`, {
        headers: {
          'Authorization': `Bearer demo-token`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAttendanceRecords(data.attendance);
        } else {
          setAttendanceRecords(mockAttendanceRecords);
        }
      } else {
        setAttendanceRecords(mockAttendanceRecords);
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
      setAttendanceRecords(mockAttendanceRecords);
    }
  };

  const handleScanQR = (sessionId) => {
    setScannerSessionId(sessionId);
    setShowScanner(true);
  };

  const handleQRCodeScan = async (qrCodeData) => {
    setIsLoading(true);
    setShowScanner(false);
    
    try {
      const response = await fetch('http://localhost:5000/api/session/submit-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer demo-token`
        },
        body: JSON.stringify({
          sessionId: scannerSessionId,
          qrData: qrCodeData
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setAttendanceMessage('✅ Attendance marked successfully!');
        loadAttendanceRecords();
        setTimeout(() => setAttendanceMessage(''), 3000);
      } else {
        setAttendanceMessage(`❌ ${data.message || 'Failed to mark attendance. Please try again.'}`);
        setTimeout(() => setAttendanceMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      setAttendanceMessage('❌ Error scanning QR code. Please try again.');
      setTimeout(() => setAttendanceMessage(''), 3000);
    } finally {
      setIsLoading(false);
      setScannerSessionId(null);
    }
  };

  const filteredAttendanceRecords = selectedCourse === 'all' 
    ? attendanceRecords 
    : attendanceRecords.filter(record => record.subject.toLowerCase() === courses.find(c => c.id === parseInt(selectedCourse))?.name.toLowerCase());

  const getAttendanceStats = () => {
    const records = filteredAttendanceRecords;
    const present = records.filter(r => r.status === 'Present').length;
    const total = records.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    return { present, total, percentage };
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h1>Welcome back, {studentData?.name}!</h1>
        <p>Here are your active sessions and attendance summary</p>
      </div>

      {attendanceMessage && (
        <div className={`attendance-message ${attendanceMessage.includes('✅') ? 'success' : 'error'}`}>
          {attendanceMessage}
        </div>
      )}

      <div className="active-sessions-section">
        <h2>Current Ongoing Sessions</h2>
        {activeSessions.length > 0 ? (
          <div className="sessions-grid">
            {activeSessions.map((session) => (
              <div key={session.session_id} className="session-card">
                <div className="session-header">
                  <h3>{session.subject}</h3>
                  <span className="session-status active">Live</span>
                </div>
                <div className="session-details">
                  <p><strong>Instructor:</strong> {session.instructor}</p>
                  <p><strong>Time:</strong> {session.time}</p>
                  <p><strong>Location:</strong> {session.location}</p>
                  <p><strong>Date:</strong> {session.date}</p>
                </div>
                <button 
                  className="scan-qr-btn"
                  onClick={() => handleScanQR(session.session_id)}
                  disabled={isLoading}
                >
                  {isLoading && scannerSessionId === session.session_id ? 'Processing...' : 'Scan QR Code'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-sessions">
            <p>No active sessions at the moment</p>
          </div>
        )}
      </div>

      <div className="attendance-summary">
        <h2>Attendance Overview</h2>
        <div className="stats-cards">
          <div className="stat-card">
            <h3>{getAttendanceStats().present}</h3>
            <p>Classes Attended</p>
          </div>
          <div className="stat-card">
            <h3>{getAttendanceStats().total}</h3>
            <p>Total Classes</p>
          </div>
          <div className="stat-card">
            <h3>{getAttendanceStats().percentage}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="courses-content">
      <div className="courses-header">
        <h1>My Courses</h1>
        <div className="course-filter">
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="attendance-records">
        <h2>Attendance Records</h2>
        {filteredAttendanceRecords.length > 0 ? (
          <div className="attendance-table">
            <div className="table-header">
              <div>Date</div>
              <div>Subject</div>
              <div>Time</div>
              <div>Status</div>
              <div>Marked At</div>
            </div>
            {filteredAttendanceRecords.map((record) => (
              <div key={record.id} className="table-row">
                <div>{record.date}</div>
                <div>{record.subject}</div>
                <div>{record.time}</div>
                <div className={`status ${record.status.toLowerCase()}`}>
                  {record.status}
                </div>
                <div>{record.marked_at ? new Date(record.marked_at).toLocaleString() : 'N/A'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-records">
            <p>No attendance records found for the selected course</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-content">
      <h1>Profile Settings</h1>
      <div className="profile-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={studentData?.name || ''} readOnly />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={studentData?.email || ''} readOnly />
        </div>
        <div className="form-group">
          <label>Roll Number</label>
          <input type="text" value={studentData?.rollNumber || ''} readOnly />
        </div>
        <div className="form-group">
          <label>Class</label>
          <input type="text" value={studentData?.class || ''} readOnly />
        </div>
        <div className="form-group">
          <label>Section</label>
          <input type="text" value={studentData?.section || ''} readOnly />
        </div>
        <button className="edit-profile-btn">Edit Profile</button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'courses':
        return renderCourses();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="student-dashboard">
      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="navbar-brand">
          <h2>Student Portal</h2>
        </div>
        <div className="navbar-right">
          <div className="student-profile">
            <div className="profile-info">
              <span className="student-name">{studentData?.name}</span>
              <span className="student-role">Student</span>
            </div>
            <div className="profile-avatar">
              {studentData?.profileImage ? (
                <img src={studentData.profileImage} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {studentData?.name?.charAt(0) || 'S'}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="dashboard-container">
        {/* Side Navigation */}
        <aside className="side-navigation">
          <div className="nav-menu">
            <button 
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              <span className="nav-icon">📊</span>
              Dashboard
            </button>
            <button 
              className={`nav-item ${activeSection === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveSection('courses')}
            >
              <span className="nav-icon">📚</span>
              Courses
            </button>
            <button 
              className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              <span className="nav-icon">⚙️</span>
              Settings
            </button>
          </div>
          <div className="nav-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="qr-scanner-modal">
          <div className="qr-scanner-content">
            <div className="scanner-header">
              <h3>Scan QR Code</h3>
              <button 
                className="close-scanner"
                onClick={() => setShowScanner(false)}
              >
                ×
              </button>
            </div>
            <div className="scanner-body">
              <div className="camera-placeholder">
                <div className="scanning-animation">
                  <div className="scan-line"></div>
                </div>
                <p>Position the QR code within the frame</p>
              </div>
              <div className="scanner-actions">
                <button 
                  className="demo-scan-btn"
                  onClick={() => handleQRCodeScan('demo-qr-data')}
                >
                  Demo Scan
                </button>
                <input 
                  type="text" 
                  placeholder="Or enter QR code manually"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      handleQRCodeScan(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedStudentDashboard;
