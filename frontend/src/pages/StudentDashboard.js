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
  
  // Manual schedule management
  const [studentSchedule, setStudentSchedule] = useState([]);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [newScheduleEntry, setNewScheduleEntry] = useState({
    date: '',
    startTime: '',
    endTime: '',
    courseName: '',
    courseCode: '',
    classroom: '',
    instructor: ''
  });

  // Load schedule from localStorage on component mount
  useEffect(() => {
    const savedSchedule = localStorage.getItem('studentSchedule');
    if (savedSchedule) {
      setStudentSchedule(JSON.parse(savedSchedule));
    }
    
    const savedStudentData = localStorage.getItem('studentData');
    if (savedStudentData) {
      setStudentData(JSON.parse(savedStudentData));
    }
    
    const savedAttendance = localStorage.getItem('attendanceHistory');
    if (savedAttendance) {
      setAttendanceHistory(JSON.parse(savedAttendance));
    }
  }, []);

  // Save schedule to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('studentSchedule', JSON.stringify(studentSchedule));
  }, [studentSchedule]);

  // Function to get currently active sessions based on time and date
  const getCurrentActiveSessions = () => {
    const currentTime = new Date();
    const currentDate = currentTime.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    
    return studentSchedule.filter(session => {
      if (session.date !== currentDate) return false;
      
      const [startHour, startMin] = session.startTime.split(':').map(Number);
      const [endHour, endMin] = session.endTime.split(':').map(Number);
      
      const sessionStart = startHour * 60 + startMin;
      const sessionEnd = endHour * 60 + endMin;
      const currentTimeMinutes = currentHours * 60 + currentMinutes;
      
      // Session is active if current time is within 30 minutes before start time and before end time
      return currentTimeMinutes >= (sessionStart - 30) && currentTimeMinutes <= sessionEnd;
    });
  };

  // Function to get today's schedule
  const getTodaysSchedule = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    return studentSchedule.filter(session => session.date === currentDate).sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
  };

  // Function to add new schedule entry
  const handleAddSchedule = () => {
    if (!newScheduleEntry.date || !newScheduleEntry.startTime || !newScheduleEntry.endTime || 
        !newScheduleEntry.courseName || !newScheduleEntry.courseCode || !newScheduleEntry.classroom) {
      alert('Please fill in all required fields');
      return;
    }

    const scheduleEntry = {
      id: Date.now(),
      ...newScheduleEntry,
      qrCode: `${newScheduleEntry.courseCode}-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setStudentSchedule(prev => [...prev, scheduleEntry]);
    setNewScheduleEntry({
      date: '',
      startTime: '',
      endTime: '',
      courseName: '',
      courseCode: '',
      classroom: '',
      instructor: ''
    });
    setShowAddScheduleModal(false);
  };

  // Function to delete schedule entry
  const handleDeleteSchedule = (scheduleId) => {
    setStudentSchedule(prev => prev.filter(schedule => schedule.id !== scheduleId));
  };

  // QR Scanning functions
  const handleQRScan = (sessionId, courseCode) => {
    setScanningFor({ sessionId, courseCode });
    setShowQRScanner(true);
    setShowManualInput(false);
    setManualQRCode('');
  };

  const handleScanResult = () => {
    if (!scanningFor) return;

    // Simulate scanning process
    setTimeout(() => {
      const currentSession = studentSchedule.find(s => s.id === scanningFor.sessionId);
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
    const matchingSession = studentSchedule.find(s => s.qrCode === qrCode);
    
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

  // Function to get courses from schedule
  const getScheduledCourses = () => {
    const uniqueCourses = {};
    studentSchedule.forEach(session => {
      uniqueCourses[session.courseCode] = {
        id: session.id,
        name: session.courseName,
        code: session.courseCode,
        instructor: session.instructor || 'TBA',
        classroom: session.classroom,
        status: 'active'
      };
    });
    return Object.values(uniqueCourses);
  };

  // Function to open quick scanner for current time
  const openQuickScanner = () => {
    const currentSessions = getCurrentActiveSessions();
    
    if (currentSessions.length === 0) {
      alert('No active sessions right now!');
      return;
    }
    
    // If only one session, open scanner directly
    if (currentSessions.length === 1) {
      handleQRScan(currentSessions[0].id, currentSessions[0].courseCode);
    } else {
      // If multiple sessions, show selection (for now, pick the first one)
      handleQRScan(currentSessions[0].id, currentSessions[0].courseCode);
    }
  };

  // Function to get weekly schedule grid
  const getWeeklyScheduleGrid = () => {
    // Generate time slots from 8 AM to 6 PM
    const timeSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const slot = {
        time: timeString,
        classes: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] }
      };
      
      // Find classes for this time slot
      studentSchedule.forEach(session => {
        const sessionDate = new Date(session.date);
        const dayName = sessionDate.toLocaleDateString('en-US', { weekday: 'long' });
        const sessionHour = parseInt(session.startTime.split(':')[0]);
        
        if (sessionHour === hour && slot.classes[dayName]) {
          slot.classes[dayName].push(session);
        }
      });
      
      timeSlots.push(slot);
    }
    
    return timeSlots.filter(slot => 
      Object.values(slot.classes).some(dayClasses => dayClasses.length > 0)
    );
  };

  const renderDashboardTab = () => {
    const currentSessions = getCurrentActiveSessions();
    const todaysSchedule = getTodaysSchedule();
    
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
                    {session.courseCode} ({session.startTime} - {session.endTime})
                  </span>
                ))}
              </div>
              <button 
                className="quick-scan-btn"
                onClick={openQuickScanner}
              >
                📱 Scan QR
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
            {todaysSchedule.length > 0 ? (
              <div className="session-grid">
                {todaysSchedule.map(session => {
                  const isCurrentlyActive = currentSessions.some(cs => cs.id === session.id);
                  return (
                    <div key={session.id} className={`session-card ${isCurrentlyActive ? 'active-now' : ''}`}>
                      {isCurrentlyActive && <span className="live-indicator">🔴 LIVE</span>}
                      <h4>{session.courseName}</h4>
                      <p><strong>Code:</strong> {session.courseCode}</p>
                      <p><strong>Time:</strong> {session.startTime} - {session.endTime}</p>
                      <p><strong>Room:</strong> {session.classroom}</p>
                      {session.instructor && <p><strong>Instructor:</strong> {session.instructor}</p>}
                      {isCurrentlyActive && (
                        <button 
                          className="scan-btn"
                          onClick={() => handleQRScan(session.id, session.courseCode)}
                        >
                          📱 Mark
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-schedule-message">
                <div className="no-schedule-icon">📅</div>
                <h4>No classes scheduled for today</h4>
                <p>Enjoy your free day! Add classes to your schedule using the Schedule tab.</p>
              </div>
            )}
          </div>

          <div className="section">
            <h3>Quick Schedule Management</h3>
            <div className="quick-actions">
              <button 
                className="action-btn primary"
                onClick={() => setShowAddScheduleModal(true)}
              >
                ➕ Add Class
              </button>
              <button 
                className="action-btn secondary"
                onClick={() => setActiveTab('sessions')}
              >
                📋 View Schedule
              </button>
            </div>
          </div>

          <div className="section">
            <h3>Recent Activity</h3>
            <div className="activity-feed">
              {attendanceHistory.slice(-5).reverse().map(record => (
                <div key={record.id} className="attendance-record">
                  <div className="record-info">
                    <h4>{record.courseName}</h4>
                    <p><strong>Course Code:</strong> {record.courseCode}</p>
                    <p><strong>Date & Time:</strong> {record.scanTime}</p>
                    <p><strong>Scan Method:</strong> {record.scanType === 'camera' ? '📷 Camera' : '⌨️ Manual'}</p>
                  </div>
                  <span className="attendance-status">✅ Present</span>
                </div>
              ))}
              {attendanceHistory.length === 0 && (
                <p className="no-activity">No attendance records yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSessionsTab = () => {
    const todaysDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const currentSessions = getCurrentActiveSessions();

    return (
      <div className="sessions-content">
        <div className="schedule-header">
          <div className="schedule-title">
            <h2>Class Schedule</h2>
            <p className="schedule-date">Today: {todaysDate}</p>
          </div>
          <div className="schedule-actions">
            <button 
              className="action-btn primary"
              onClick={() => setShowAddScheduleModal(true)}
            >
              ➕ Add Class
            </button>
          </div>
        </div>

        {studentSchedule.length === 0 ? (
          <div className="no-routine-message">
            <div className="no-routine-icon">📚</div>
            <h3>No routine made</h3>
            <p>You haven't created your class schedule yet. Start by adding your first class!</p>
            <button 
              className="action-btn primary"
              onClick={() => setShowAddScheduleModal(true)}
            >
              ➕ Create Schedule
            </button>
          </div>
        ) : (
          <>
            {/* Today's Schedule Section */}
            <div className="todays-schedule">
              <h3>Today's Classes</h3>
              {getTodaysSchedule().length > 0 ? (
                <div className="todays-sessions">
                  {getTodaysSchedule().map(session => {
                    const isLive = currentSessions.some(cs => cs.id === session.id);
                    return (
                      <div key={session.id} className={`today-session-card ${isLive ? 'live' : ''}`}>
                        {isLive && <span className="live-badge">🔴 LIVE NOW</span>}
                        <div className="session-info">
                          <h4>{session.courseName}</h4>
                          <p>{session.courseCode} • {session.classroom}</p>
                          <p>{session.startTime} - {session.endTime}</p>
                          {session.instructor && <p>👨‍🏫 {session.instructor}</p>}
                        </div>
                        {isLive && (
                          <button 
                            className="attend-btn"
                            onClick={() => handleQRScan(session.id, session.courseCode)}
                          >
                            📱 Mark
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-classes-today">
                  <p>🎉 No classes scheduled for today!</p>
                </div>
              )}
            </div>

            {/* Full Weekly Schedule */}
            <div className="full-schedule">
              <h3>Complete Schedule</h3>
              <div className="schedule-list">
                {studentSchedule
                  .sort((a, b) => new Date(a.date) - new Date(b.date) || a.startTime.localeCompare(b.startTime))
                  .map(session => (
                    <div key={session.id} className="schedule-item">
                      <div className="schedule-date">
                        {new Date(session.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="schedule-details">
                        <h4>{session.courseName} ({session.courseCode})</h4>
                        <p>⏰ {session.startTime} - {session.endTime}</p>
                        <p>📍 {session.classroom}</p>
                        {session.instructor && <p>👨‍🏫 {session.instructor}</p>}
                      </div>
                      <div className="schedule-actions">
                        <button 
                          className="delete-schedule-btn"
                          onClick={() => handleDeleteSchedule(session.id)}
                          title="Delete this class"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        )}

        {/* Add New Class Modal */}
        {showAddScheduleModal && (
          <div className="modal-overlay">
            <div className="modal-content schedule-modal">
              <h3>Add New Class to Schedule</h3>
              <div className="schedule-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={newScheduleEntry.date}
                      onChange={(e) => setNewScheduleEntry(prev => ({...prev, date: e.target.value}))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Time *</label>
                    <input
                      type="time"
                      value={newScheduleEntry.startTime}
                      onChange={(e) => setNewScheduleEntry(prev => ({...prev, startTime: e.target.value}))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time *</label>
                    <input
                      type="time"
                      value={newScheduleEntry.endTime}
                      onChange={(e) => setNewScheduleEntry(prev => ({...prev, endTime: e.target.value}))}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Course Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Computer Science 101"
                      value={newScheduleEntry.courseName}
                      onChange={(e) => setNewScheduleEntry(prev => ({...prev, courseName: e.target.value}))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Course Code *</label>
                    <input
                      type="text"
                      placeholder="e.g., CS101"
                      value={newScheduleEntry.courseCode}
                      onChange={(e) => setNewScheduleEntry(prev => ({...prev, courseCode: e.target.value.toUpperCase()}))}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Classroom *</label>
                    <input
                      type="text"
                      placeholder="e.g., Room 101, Lab A"
                      value={newScheduleEntry.classroom}
                      onChange={(e) => setNewScheduleEntry(prev => ({...prev, classroom: e.target.value}))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Instructor</label>
                    <input
                      type="text"
                      placeholder="e.g., Dr. Smith"
                      value={newScheduleEntry.instructor}
                      onChange={(e) => setNewScheduleEntry(prev => ({...prev, instructor: e.target.value}))}
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="action-btn primary"
                    onClick={handleAddSchedule}
                  >
                    ✅ Add
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => {
                      setShowAddScheduleModal(false);
                      setNewScheduleEntry({
                        date: '',
                        startTime: '',
                        endTime: '',
                        courseName: '',
                        courseCode: '',
                        classroom: '',
                        instructor: ''
                      });
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCoursesTab = () => {
    const scheduledCourses = getScheduledCourses();
    
    return (
      <div className="courses-content">
        <div className="courses-header">
          <h3>My Enrolled Courses</h3>
          <button 
            className="action-btn primary"
            onClick={() => setShowAddScheduleModal(true)}
          >
            ➕ Add
          </button>
        </div>
        
        {scheduledCourses.length > 0 ? (
          <div className="courses-grid">
            {scheduledCourses.map(course => (
              <div key={course.id} className="course-card">
                <h4>{course.name}</h4>
                <p><strong>Code:</strong> {course.code}</p>
                <p><strong>Instructor:</strong> {course.instructor}</p>
                <p><strong>Classroom:</strong> {course.classroom}</p>
                <span className={`status-badge ${course.status}`}>
                  {course.status === 'active' ? '✅ Active' : '⏸️ Inactive'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-courses-message">
            <div className="no-courses-icon">📚</div>
            <h4>No courses enrolled</h4>
            <p>Start by adding your first course to create your schedule.</p>
          </div>
        )}
      </div>
    );
  };

  const renderAttendanceTab = () => (
    <div className="attendance-content">
      <h3>Attendance History</h3>
      {attendanceHistory.length > 0 ? (
        <div className="attendance-list">
          {attendanceHistory.slice().reverse().map(record => (
            <div key={record.id} className="attendance-record">
              <div className="record-info">
                <h4>{record.courseName}</h4>
                <p><strong>Course Code:</strong> {record.courseCode}</p>
                <p><strong>Date & Time:</strong> {record.scanTime}</p>
                <p><strong>Scan Method:</strong> {record.scanType === 'camera' ? '📷 Camera' : '⌨️ Manual'}</p>
              </div>
              <span className="attendance-status">✅ Present</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-attendance-message">
          <div className="no-attendance-icon">📋</div>
          <h4>No attendance records</h4>
          <p>Your attendance history will appear here once you start marking attendance.</p>
        </div>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="profile-content">
      <h3>Student Profile</h3>
      {Object.keys(studentData).length > 0 ? (
        <div className="profile-info">
          <div className="profile-section">
            <h4>Personal Information</h4>
            <p><strong>Full Name:</strong> {studentData.fullName || 'Not provided'}</p>
            <p><strong>Roll Number:</strong> {studentData.rollNumber || 'Not provided'}</p>
            <p><strong>Registration Number:</strong> {studentData.registrationNumber || 'Not provided'}</p>
            <p><strong>Phone:</strong> {studentData.phoneNumber || 'Not provided'}</p>
            <p><strong>Gender:</strong> {studentData.gender || 'Not provided'}</p>
          </div>
          <div className="profile-section">
            <h4>Academic Information</h4>
            <p><strong>Department:</strong> {studentData.department || 'Not provided'}</p>
            <p><strong>Year:</strong> {studentData.year || 'Not provided'}</p>
            <p><strong>Semester:</strong> {studentData.semester || 'Not provided'}</p>
            <p><strong>Section:</strong> {studentData.section || 'Not provided'}</p>
            {studentData.coursesEnrolled && (
              <p><strong>Courses:</strong> {studentData.coursesEnrolled.join(', ')}</p>
            )}
          </div>
          <button 
            className="action-btn secondary"
            onClick={() => navigate('/student-profile')}
          >
            ✏️ Edit
          </button>
        </div>
      ) : (
        <div className="incomplete-profile">
          <div className="profile-icon">👤</div>
          <h4>Profile Incomplete</h4>
          <p>Complete your profile to get the most out of your dashboard experience.</p>
          <button 
            className="action-btn primary"
            onClick={() => navigate('/student-profile')}
          >
            📝 Complete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="student-dashboard">
      <Nav />
      
      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <h2>{sidebarCollapsed ? 'SD' : 'Student Dashboard'}</h2>
            <button 
              className="collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              <li className={activeTab === 'dashboard' ? 'active' : ''}>
                <button onClick={() => setActiveTab('dashboard')}>
                  <span className="nav-icon">🏠</span>
                  {!sidebarCollapsed && <span className="nav-text">Dashboard</span>}
                </button>
              </li>
              <li className={activeTab === 'sessions' ? 'active' : ''}>
                <button onClick={() => setActiveTab('sessions')}>
                  <span className="nav-icon">📅</span>
                  {!sidebarCollapsed && <span className="nav-text">Schedule</span>}
                </button>
              </li>
              <li className={activeTab === 'courses' ? 'active' : ''}>
                <button onClick={() => setActiveTab('courses')}>
                  <span className="nav-icon">📚</span>
                  {!sidebarCollapsed && <span className="nav-text">Courses</span>}
                </button>
              </li>
              <li className={activeTab === 'attendance' ? 'active' : ''}>
                <button onClick={() => setActiveTab('attendance')}>
                  <span className="nav-icon">📋</span>
                  {!sidebarCollapsed && <span className="nav-text">Attendance</span>}
                </button>
              </li>
              <li className={activeTab === 'profile' ? 'active' : ''}>
                <button onClick={() => setActiveTab('profile')}>
                  <span className="nav-icon">👤</span>
                  {!sidebarCollapsed && <span className="nav-text">Profile</span>}
                </button>
              </li>
              <li className="logout-item">
                <button onClick={() => navigate('/logout')}>
                  <span className="nav-icon">🚪</span>
                  {!sidebarCollapsed && <span className="nav-text">Logout</span>}
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="content-header">
            <h1>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'sessions' && 'Class Schedule'}
              {activeTab === 'courses' && 'My Courses'}
              {activeTab === 'attendance' && 'Attendance Records'}
              {activeTab === 'profile' && 'Student Profile'}
            </h1>
          </div>
          
          <div className="tab-content">
            {(() => {
              switch (activeTab) {
                case 'dashboard': return renderDashboardTab();
                case 'sessions': return renderSessionsTab();
                case 'courses': return renderCoursesTab();
                case 'attendance': return renderAttendanceTab();
                case 'profile': return renderProfileTab();
                default: return renderDashboardTab();
              }
            })()}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="modal-overlay">
          <div className="modal-content scanner-modal">
            <div className="scanner-header">
              <h3>Scan QR Code for Attendance</h3>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setShowQRScanner(false);
                  setScanningFor(null);
                  setShowManualInput(false);
                  setManualQRCode('');
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="scanner-content">
              {scanningFor && (
                <div className="scan-info">
                  <p>Scanning for: <strong>{scanningFor.courseCode}</strong></p>
                </div>
              )}
              
              {!showManualInput ? (
                <div className="camera-section">
                  <div className="camera-preview">
                    {isScanning ? (
                      <div className="scanning-animation">
                        <div className="scan-line"></div>
                        <p>Scanning QR Code...</p>
                      </div>
                    ) : (
                      <div className="camera-placeholder">
                        <div className="camera-icon">📷</div>
                        <p>Position QR code within the frame</p>
                        <button 
                          className="start-scan-btn"
                          onClick={() => {
                            setIsScanning(true);
                            handleScanResult();
                          }}
                        >
                          Start Scanning
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="scanner-options">
                    <button 
                      className="manual-input-btn"
                      onClick={() => setShowManualInput(true)}
                    >
                      ⌨️ Manual
                    </button>
                  </div>
                </div>
              ) : (
                <div className="manual-input-section">
                  <h4>Enter QR Code Manually</h4>
                  <div className="manual-input-form">
                    <input
                      type="text"
                      placeholder="Enter QR code here..."
                      value={manualQRCode}
                      onChange={(e) => setManualQRCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualQRSubmit()}
                    />
                    <div className="manual-input-actions">
                      <button 
                        className="submit-btn"
                        onClick={handleManualQRSubmit}
                      >
                        ✅ Submit
                      </button>
                      <button 
                        className="back-btn"
                        onClick={() => setShowManualInput(false)}
                      >
                        📷 Camera
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;