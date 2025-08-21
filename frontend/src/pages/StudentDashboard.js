import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StudentDashboard.css';
import Nav from './Nav';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanningFor, setScanningFor] = useState(null);
  const [studentData, setStudentData] = useState({});
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualQRCode, setManualQRCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Sample courses data - in real app this would come from API
  const [enrolledCourses] = useState([
    { id: 1, name: 'Computer Science 101', code: 'CS101', instructor: 'Dr. Smith', time: '9:00 AM - 10:30 AM', status: 'active' },
    { id: 2, name: 'Mathematics 201', code: 'MATH201', instructor: 'Prof. Johnson', time: '11:00 AM - 12:30 PM', status: 'active' },
    { id: 3, name: 'Physics 301', code: 'PHY301', instructor: 'Dr. Brown', time: '2:00 PM - 3:30 PM', status: 'active' },
    { id: 4, name: 'Chemistry 202', code: 'CHEM202', instructor: 'Prof. Davis', time: '4:00 PM - 5:30 PM', status: 'completed' }
  ]);

  // Sample sessions data with time-based logic
  const [activeSessions] = useState([
    { id: 1, courseCode: 'CS101', courseName: 'Computer Science 101', time: '9:00 AM', date: '2025-08-20', qrCode: 'CS101-SESSION-001', startTime: '09:00', endTime: '10:30' },
    { id: 2, courseCode: 'MATH201', courseName: 'Mathematics 201', time: '11:00 AM', date: '2025-08-20', qrCode: 'MATH201-SESSION-001', startTime: '11:00', endTime: '12:30' },
    { id: 3, courseCode: 'PHY301', courseName: 'Physics 301', time: '2:00 PM', date: '2025-08-20', qrCode: 'PHY301-SESSION-001', startTime: '14:00', endTime: '15:30' }
  ]);

  // Function to get currently active sessions based on time
  const getCurrentActiveSessions = () => {
    const currentTime = new Date();
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTimeString = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    
    return activeSessions.filter(session => {
      const [startHour, startMin] = session.startTime.split(':').map(Number);
      const [endHour, endMin] = session.endTime.split(':').map(Number);
      
      const sessionStart = startHour * 60 + startMin;
      const sessionEnd = endHour * 60 + endMin;
      const currentTimeMinutes = currentHours * 60 + currentMinutes;
      
      // Session is active if current time is within 30 minutes before start time and before end time
      return currentTimeMinutes >= (sessionStart - 30) && currentTimeMinutes <= sessionEnd;
    });
  };

  useEffect(() => {
    // Load student profile data
    const savedProfile = localStorage.getItem('studentProfile');
    if (savedProfile) {
      setStudentData(JSON.parse(savedProfile));
    }

    // Load attendance history
    const savedAttendance = localStorage.getItem('attendanceHistory');
    if (savedAttendance) {
      setAttendanceHistory(JSON.parse(savedAttendance));
    }
  }, []);

  const handleQRScan = (sessionId, courseCode) => {
    setScanningFor({ sessionId, courseCode });
    setShowQRScanner(true);
    setShowManualInput(false);
    setManualQRCode('');
    setIsScanning(false);
  };

  const simulateQRScan = () => {
    if (!scanningFor) return;
    setIsScanning(true);

    // Simulate scanning process
    setTimeout(() => {
      const currentSession = activeSessions.find(s => s.id === scanningFor.sessionId);
      const expectedQRCode = currentSession?.qrCode;
      
      markAttendance(expectedQRCode, true);
      setIsScanning(false);
    }, 3000); // 3 second simulation
  };

  const handleManualQRSubmit = () => {
    if (!manualQRCode.trim()) {
      alert('Please enter a QR code');
      return;
    }
    
    markAttendance(manualQRCode, false);
  };

  const markAttendance = (qrCode, isAutoScan) => {
    if (!scanningFor) return;

    // Validate QR code format and find matching session
    const matchingSession = activeSessions.find(s => s.qrCode === qrCode);
    
    if (!matchingSession) {
      alert('Invalid QR Code. Please check and try again.');
      return;
    }

    if (matchingSession.id !== scanningFor.sessionId) {
      alert('QR Code does not match the selected session.');
      return;
    }

    // Check if already marked attendance for this session
    const alreadyMarked = attendanceHistory.find(
      record => record.sessionId === scanningFor.sessionId && 
                record.courseCode === scanningFor.courseCode
    );

    if (alreadyMarked) {
      alert('Attendance already marked for this session!');
      setShowQRScanner(false);
      setScanningFor(null);
      setShowManualInput(false);
      setManualQRCode('');
      return;
    }

    const newAttendance = {
      id: Date.now(),
      courseCode: scanningFor.courseCode,
      courseName: matchingSession.courseName,
      sessionId: scanningFor.sessionId,
      timestamp: new Date().toISOString(),
      status: 'present',
      scanTime: new Date().toLocaleString(),
      scanType: isAutoScan ? 'camera' : 'manual',
      qrCode: qrCode
    };

    const updatedHistory = [...attendanceHistory, newAttendance];
    setAttendanceHistory(updatedHistory);
    localStorage.setItem('attendanceHistory', JSON.stringify(updatedHistory));

    setShowQRScanner(false);
    setScanningFor(null);
    setShowManualInput(false);
    setManualQRCode('');
    
    alert(`Attendance marked successfully for ${scanningFor.courseCode}! 
Scan Type: ${isAutoScan ? 'Camera Scan' : 'Manual Entry'}`);
  };

  const getActiveCoursesForToday = () => {
    return enrolledCourses.filter(course => course.status === 'active');
  };

  // Function to open quick scanner for current time
  const openQuickScanner = () => {
    const currentSessions = getCurrentActiveSessions();
    if (currentSessions.length === 0) {
      alert('No class right now. Please check your schedule.');
      return;
    }
    
    if (currentSessions.length === 1) {
      // If only one session, directly open scanner for that session
      handleQRScan(currentSessions[0].id, currentSessions[0].courseCode);
    } else {
      // If multiple sessions, show selection (for now, pick the first one)
      handleQRScan(currentSessions[0].id, currentSessions[0].courseCode);
    }
  };

  const renderDashboardTab = () => {
    const currentSessions = getCurrentActiveSessions();
    
    return (
      <div className="dashboard-content">
        {/* Quick Scanner Section */}
        <div className="quick-scanner-section">
          <h3>Quick Attendance Scanner</h3>
          {currentSessions.length > 0 ? (
            <div className="active-session-info">
              <p>Current active session{currentSessions.length > 1 ? 's' : ''}:</p>
              <div className="current-sessions">
                {currentSessions.map(session => (
                  <span key={session.id} className="current-session-tag">
                    {session.courseCode} ({session.time})
                  </span>
                ))}
              </div>
              <button 
                className="quick-scan-btn"
                onClick={openQuickScanner}
              >
                📱 Scan QR Code Now
              </button>
            </div>
          ) : (
            <div className="no-session-info">
              <p>🕐 No class right now</p>
              <p className="schedule-hint">Check your schedule below for upcoming sessions</p>
            </div>
          )}
        </div>

        <div className="dashboard-sections">
          <div className="section">
            <h3>Today's Scheduled Sessions</h3>
            <div className="session-grid">
              {activeSessions.map(session => {
                const isCurrentlyActive = currentSessions.some(cs => cs.id === session.id);
                return (
                  <div key={session.id} className={`session-card ${isCurrentlyActive ? 'active-now' : ''}`}>
                    {isCurrentlyActive && <span className="live-indicator">🔴 LIVE</span>}
                    <h4>{session.courseName}</h4>
                    <p><strong>Code:</strong> {session.courseCode}</p>
                    <p><strong>Time:</strong> {session.time}</p>
                    <p><strong>Date:</strong> {session.date}</p>
                    <button 
                      className="scan-btn"
                      onClick={() => handleQRScan(session.id, session.courseCode)}
                      disabled={!isCurrentlyActive}
                    >
                      {isCurrentlyActive ? '📱 Scan QR for Attendance' : '⏰ Not Active Yet'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="section">
            <h3>Recent Activity</h3>
            <div className="activity-feed">
              {attendanceHistory.slice(-5).reverse().map(record => (
                <div key={record.id} className="activity-item">
                  <div className="activity-info">
                    <strong>{record.courseCode}</strong> - Attendance marked
                    <span className="activity-time">{record.scanTime}</span>
                  </div>
                  <span className={`status ${record.status}`}>{record.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSessionsTab = () => {
    const currentSessions = getCurrentActiveSessions();
    
    // Create a weekly schedule structure
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      { time: '9:00 AM - 10:30 AM', period: '1st Period' },
      { time: '11:00 AM - 12:30 PM', period: '2nd Period' },
      { time: '2:00 PM - 3:30 PM', period: '3rd Period' },
      { time: '4:00 PM - 5:30 PM', period: '4th Period' }
    ];

    // Sample weekly schedule data
    const weeklySchedule = {
      'Monday': [
        { course: 'CS101', name: 'Computer Science 101', instructor: 'Dr. Smith', room: 'Lab 101', time: '9:00 AM - 10:30 AM' },
        { course: 'MATH201', name: 'Mathematics 201', instructor: 'Prof. Johnson', room: 'Room 205', time: '11:00 AM - 12:30 PM' }
      ],
      'Tuesday': [
        { course: 'PHY301', name: 'Physics 301', instructor: 'Dr. Brown', room: 'Lab 301', time: '2:00 PM - 3:30 PM' },
        { course: 'CHEM202', name: 'Chemistry 202', instructor: 'Prof. Davis', room: 'Lab 201', time: '4:00 PM - 5:30 PM' }
      ],
      'Wednesday': [
        { course: 'CS101', name: 'Computer Science 101', instructor: 'Dr. Smith', room: 'Lab 101', time: '9:00 AM - 10:30 AM' },
        { course: 'MATH201', name: 'Mathematics 201', instructor: 'Prof. Johnson', room: 'Room 205', time: '11:00 AM - 12:30 PM' }
      ],
      'Thursday': [
        { course: 'PHY301', name: 'Physics 301', instructor: 'Dr. Brown', room: 'Lab 301', time: '2:00 PM - 3:30 PM' }
      ],
      'Friday': [
        { course: 'CS101', name: 'Computer Science 101', instructor: 'Dr. Smith', room: 'Lab 101', time: '9:00 AM - 10:30 AM' },
        { course: 'CHEM202', name: 'Chemistry 202', instructor: 'Prof. Davis', room: 'Lab 201', time: '4:00 PM - 5:30 PM' }
      ]
    };

    const getCurrentDay = () => {
      const today = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[today.getDay()];
    };

    const currentDay = getCurrentDay();

    return (
      <div className="sessions-content">
        <div className="schedule-header">
          <h3>📅 Weekly Class Schedule</h3>
          <div className="schedule-info">
            <span className="current-day">Today: {currentDay}</span>
            {currentSessions.length > 0 && (
              <span className="live-sessions">{currentSessions.length} Live Session{currentSessions.length > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Today's Schedule Highlight */}
        <div className="today-schedule">
          <h4>🔥 Today's Classes ({currentDay})</h4>
          {weeklySchedule[currentDay] && weeklySchedule[currentDay].length > 0 ? (
            <div className="today-classes">
              {weeklySchedule[currentDay].map((classItem, index) => {
                const isLive = currentSessions.some(cs => cs.courseCode === classItem.course);
                return (
                  <div key={index} className={`today-class-card ${isLive ? 'live' : ''}`}>
                    {isLive && <span className="live-badge">🔴 LIVE</span>}
                    <div className="class-main-info">
                      <h5>{classItem.course} - {classItem.name}</h5>
                      <p className="class-time">⏰ {classItem.time}</p>
                    </div>
                    <div className="class-details">
                      <p>👨‍🏫 {classItem.instructor}</p>
                      <p>🏛️ {classItem.room}</p>
                    </div>
                    {isLive && (
                      <button 
                        className="quick-attendance-btn"
                        onClick={() => {
                          const session = currentSessions.find(cs => cs.courseCode === classItem.course);
                          if (session) handleQRScan(session.id, session.courseCode);
                        }}
                      >
                        📱 Mark Attendance
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-classes">🎉 No classes today! Enjoy your free day.</p>
          )}
        </div>

        {/* Weekly Schedule Grid */}
        <div className="weekly-schedule">
          <h4>📊 Full Week Schedule</h4>
          <div className="schedule-grid">
            <div className="schedule-header-row">
              <div className="time-column-header">Time</div>
              {weekDays.map(day => (
                <div key={day} className={`day-header ${day === currentDay ? 'current-day' : ''}`}>
                  {day}
                </div>
              ))}
            </div>
            
            {timeSlots.map((slot, timeIndex) => (
              <div key={timeIndex} className="schedule-row">
                <div className="time-slot">
                  <div className="period">{slot.period}</div>
                  <div className="time">{slot.time}</div>
                </div>
                {weekDays.map(day => {
                  const dayClasses = weeklySchedule[day] || [];
                  const classInSlot = dayClasses.find(c => c.time === slot.time);
                  return (
                    <div key={`${day}-${timeIndex}`} className={`schedule-cell ${day === currentDay ? 'current-day' : ''}`}>
                      {classInSlot ? (
                        <div className="schedule-class">
                          <div className="class-code">{classInSlot.course}</div>
                          <div className="class-room">{classInSlot.room}</div>
                        </div>
                      ) : (
                        <div className="no-class">-</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="schedule-actions">
          <div className="action-buttons">
            <button className="action-btn download">
              <span>📥 Download Schedule</span>
            </button>
            <button className="action-btn reminder">
              <span>🔔 Set Reminders</span>
            </button>
            <button 
              className="action-btn primary"
              onClick={openQuickScanner}
              disabled={currentSessions.length === 0}
            >
              <span>📱 Quick Scan</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCoursesTab = () => (
    <div className="courses-content">
      <h3>My Enrolled Courses</h3>
      <div className="course-grid">
        {enrolledCourses.map(course => (
          <div key={course.id} className="course-card">
            <h4>{course.name}</h4>
            <p><strong>Code:</strong> {course.code}</p>
            <p><strong>Instructor:</strong> {course.instructor}</p>
            <p><strong>Time:</strong> {course.time}</p>
            <div className={`course-status ${course.status}`}>
              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAttendanceTab = () => {
    // Group attendance by course
    const attendanceByCourse = attendanceHistory.reduce((acc, record) => {
      if (!acc[record.courseCode]) {
        acc[record.courseCode] = {
          courseName: record.courseName || record.courseCode,
          records: [],
          attendedSessions: 0,
          totalSessions: activeSessions.filter(s => s.courseCode === record.courseCode).length
        };
      }
      acc[record.courseCode].records.push(record);
      acc[record.courseCode].attendedSessions++;
      return acc;
    }, {});

    return (
      <div className="attendance-content">
        <h3>Attendance Report</h3>
        
        <div className="attendance-overview">
          <div className="overview-stats">
            <div className="stat-card">
              <h4>Total Courses</h4>
              <p className="stat-number">{Object.keys(attendanceByCourse).length}</p>
            </div>
            <div className="stat-card">
              <h4>Sessions Attended</h4>
              <p className="stat-number">{attendanceHistory.length}</p>
            </div>
            <div className="stat-card">
              <h4>Overall Rate</h4>
              <p className="stat-number">
                {attendanceHistory.length > 0 
                  ? Math.round((attendanceHistory.length / (activeSessions.length * enrolledCourses.filter(c => c.status === 'active').length)) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="course-attendance-breakdown">
          <h4>Course-wise Attendance</h4>
          {Object.keys(attendanceByCourse).length === 0 ? (
            <p className="no-data">No attendance records found. Start scanning QR codes to mark your attendance!</p>
          ) : (
            Object.entries(attendanceByCourse).map(([courseCode, data]) => (
              <div key={courseCode} className="course-attendance-card">
                <div className="course-header">
                  <h5>{data.courseName} ({courseCode})</h5>
                  <div className="course-attendance-rate">
                    <span className="attendance-percentage">
                      {Math.round((data.attendedSessions / Math.max(data.totalSessions, data.attendedSessions)) * 100)}%
                    </span>
                    <span className="session-count">
                      {data.attendedSessions}/{Math.max(data.totalSessions, data.attendedSessions)} sessions
                    </span>
                  </div>
                </div>
                
                <div className="attendance-records">
                  {data.records.map(record => (
                    <div key={record.id} className="attendance-record">
                      <div className="record-details">
                        <span className="record-date">{record.scanTime}</span>
                        <span className={`scan-method ${record.scanType}`}>
                          {record.scanType === 'camera' ? '📷 Camera Scan' : '⌨️ Manual Entry'}
                        </span>
                      </div>
                      <span className={`status ${record.status}`}>✓ {record.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderProfileTab = () => (
    <div className="profile-content">
      <h3>Student Profile</h3>
      {Object.keys(studentData).length === 0 ? (
        <div className="profile-incomplete">
          <p>Your profile is incomplete. Please complete your profile to get the best experience.</p>
          <button 
            className="complete-profile-btn"
            onClick={() => navigate('/student-profile')}
          >
            Complete Your Student Profile Here
          </button>
        </div>
      ) : (
        <div className="profile-display">
          <div className="profile-section">
            <h4>Personal Information</h4>
            <div className="profile-grid">
              <div className="profile-item">
                <label>Full Name:</label>
                <span>{studentData.fullName || 'Not provided'}</span>
              </div>
              <div className="profile-item">
                <label>Phone Number:</label>
                <span>{studentData.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="profile-item">
                <label>Gender:</label>
                <span>{studentData.gender || 'Not provided'}</span>
              </div>
            </div>
          </div>
          
          <div className="profile-section">
            <h4>Academic Information</h4>
            <div className="profile-grid">
              <div className="profile-item">
                <label>Roll Number:</label>
                <span>{studentData.rollNumber || 'Not provided'}</span>
              </div>
              <div className="profile-item">
                <label>Registration Number:</label>
                <span>{studentData.registrationNumber || 'Not provided'}</span>
              </div>
              <div className="profile-item">
                <label>Department:</label>
                <span>{studentData.department || 'Not provided'}</span>
              </div>
              <div className="profile-item">
                <label>Year/Semester:</label>
                <span>{studentData.yearSemester || 'Not provided'}</span>
              </div>
              <div className="profile-item">
                <label>Class Section:</label>
                <span>{studentData.classSection || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h4>Course Enrollment</h4>
            <div className="enrolled-courses-display">
              {studentData.coursesEnrolled && studentData.coursesEnrolled.length > 0 ? (
                studentData.coursesEnrolled.map((course, index) => (
                  <span key={index} className="course-tag">{course}</span>
                ))
              ) : (
                <p>No courses selected</p>
              )}
            </div>
          </div>

          <button 
            className="edit-profile-btn"
            onClick={() => navigate('/student-profile')}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboardTab();
      case 'sessions': return renderSessionsTab();
      case 'courses': return renderCoursesTab();
      case 'attendance': return renderAttendanceTab();
      case 'profile': return renderProfileTab();
      default: return renderDashboardTab();
    }
  };

  return (
    <div className="student-dashboard">
      <Nav />
      
      <div className={`dashboard-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Sidebar Navigation */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Student Portal</h2>
            <button 
              className="collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="nav-icon">🏠</span>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              <span className="nav-icon">📅</span>
              {!sidebarCollapsed && <span>Schedule</span>}
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <span className="nav-icon">📚</span>
              {!sidebarCollapsed && <span>My Courses</span>}
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('attendance')}
            >
              <span className="nav-icon">✅</span>
              {!sidebarCollapsed && <span>Attendance</span>}
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="nav-icon">👤</span>
              {!sidebarCollapsed && <span>Profile</span>}
            </button>
            
            <button 
              className="nav-item logout-item"
              onClick={() => navigate('/logout')}
            >
              <span className="nav-icon">🚪</span>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="content-header">
            <h1>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'sessions' && 'Class Schedule'}
              {activeTab === 'courses' && 'My Courses'}
              {activeTab === 'attendance' && 'Attendance History'}
              {activeTab === 'profile' && 'Student Profile'}
            </h1>
          </div>
          
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Enhanced QR Scanner Modal */}
      {showQRScanner && (
        <div className="qr-scanner-modal">
          <div className="qr-scanner-content">
            <div className="scanner-header">
              <h3>Mark Attendance for {scanningFor?.courseCode}</h3>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setShowQRScanner(false); 
                  setScanningFor(null);
                  setShowManualInput(false);
                  setManualQRCode('');
                  setIsScanning(false);
                }}
              >
                ✕
              </button>
            </div>

            <div className="scanner-methods">
              <div className="method-tabs">
                <button 
                  className={`method-tab ${!showManualInput ? 'active' : ''}`}
                  onClick={() => setShowManualInput(false)}
                >
                  📷 Camera Scanner
                </button>
                <button 
                  className={`method-tab ${showManualInput ? 'active' : ''}`}
                  onClick={() => setShowManualInput(true)}
                >
                  ⌨️ Manual Entry
                </button>
              </div>

              {!showManualInput ? (
                <div className="camera-scanner">
                  <div className="camera-view">
                    <div className="scanner-overlay">
                      <div className="scanner-frame">
                        <div className="corner-tl"></div>
                        <div className="corner-tr"></div>
                        <div className="corner-bl"></div>
                        <div className="corner-br"></div>
                        <div className={`scanning-line ${isScanning ? 'scanning' : ''}`}></div>
                      </div>
                      <div className="scanner-text">
                        {isScanning ? 'Scanning QR Code...' : 'Position QR code within the frame'}
                      </div>
                    </div>
                    <div className="camera-background">
                      <div className="camera-grid">
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className="grid-dot"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="scanner-actions">
                    <button 
                      className="scan-btn primary"
                      onClick={simulateQRScan}
                      disabled={isScanning}
                    >
                      {isScanning ? '🔍 Scanning...' : '📱 Start Camera Scan'}
                    </button>
                  </div>
                  
                  <div className="scanner-instructions">
                    <p>📋 Instructions:</p>
                    <ul>
                      <li>Hold your phone steady</li>
                      <li>Ensure QR code is well-lit</li>
                      <li>Position QR code within the frame</li>
                      <li>Wait for automatic detection</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="manual-input">
                  <div className="input-section">
                    <label htmlFor="manual-qr">Enter QR Code:</label>
                    <input
                      id="manual-qr"
                      type="text"
                      placeholder="Enter or paste QR code here..."
                      value={manualQRCode}
                      onChange={(e) => setManualQRCode(e.target.value)}
                      className="qr-input"
                    />
                    <p className="input-help">
                      Expected format: {scanningFor?.courseCode}-SESSION-XXX
                    </p>
                  </div>
                  <div className="scanner-actions">
                    <button 
                      className="scan-btn primary"
                      onClick={handleManualQRSubmit}
                      disabled={!manualQRCode.trim()}
                    >
                      ✅ Mark Attendance
                    </button>
                  </div>
                </div>
              )}

              <div className="scanner-footer">
                <button 
                  className="cancel-scan-btn"
                  onClick={() => {
                    setShowQRScanner(false); 
                    setScanningFor(null);
                    setShowManualInput(false);
                    setManualQRCode('');
                    setIsScanning(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
