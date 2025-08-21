import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Nav from './Nav';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [searchParams] = useSearchParams();
  const [activeSessions, setActiveSessions] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadStudentData();
    fetchActiveSessions();
    loadAttendanceHistory();
  }, []);

  useEffect(() => {
    // Handle QR code scan attendance after student data is loaded
    const sessionId = searchParams.get('session_id');
    const teacherEmail = searchParams.get('email');
    
    if (sessionId && teacherEmail && sessionId !== 'null' && teacherEmail !== 'null' && studentData) {
      handleAttendanceSubmission(sessionId, teacherEmail);
    }
  }, [searchParams, studentData]);

  const handleAttendanceSubmission = async (sessionId, teacherEmail) => {
    try {
      const token = localStorage.getItem('token');
      const studentEmail = localStorage.getItem('email');
      
      if (!token || !studentEmail) {
        setAttendanceMessage('Please log in to mark attendance');
        return;
      }

      // Add to attendance history
      const newAttendance = {
        id: Date.now(),
        sessionId,
        teacherEmail,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: 'Present'
      };

      const currentHistory = JSON.parse(localStorage.getItem('attendanceHistory') || '[]');
      const updatedHistory = [newAttendance, ...currentHistory];
      localStorage.setItem('attendanceHistory', JSON.stringify(updatedHistory));
      setAttendanceHistory(updatedHistory);

      setAttendanceMessage(`✅ Attendance marked successfully for session: ${sessionId}`);
      
      // Clear URL parameters after processing
      navigate('/student-dashboard', { replace: true });
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      setAttendanceMessage('❌ Failed to mark attendance. Please try again.');
    }
  };

  const loadStudentData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email');
      const name = localStorage.getItem('name');

      if (!token || !email || !name) {
        navigate('/login');
        return;
      }

      setStudentData({
        email: email,
        name: name,
        profileComplete: localStorage.getItem('profileComplete') === 'true'
      });
      
    } catch (error) {
      console.error('Error loading student data:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const fetchActiveSessions = async () => {
    // Mock active sessions - in real app this would come from API
    const mockSessions = [
      {
        id: 'session_001',
        courseName: 'Mathematics',
        teacherName: 'Dr. Smith',
        time: '10:00 AM - 11:00 AM',
        room: 'Room 101',
        qrCode: 'math_session_001',
        active: true
      },
      {
        id: 'session_002',
        courseName: 'Physics',
        teacherName: 'Prof. Johnson',
        time: '2:00 PM - 3:00 PM',
        room: 'Lab 203',
        qrCode: 'physics_session_002',
        active: true
      }
    ];
    
    setActiveSessions(mockSessions);
  };

  const loadAttendanceHistory = () => {
    const history = JSON.parse(localStorage.getItem('attendanceHistory') || '[]');
    setAttendanceHistory(history);
  };

  const handleScanQR = (session) => {
    setShowScanner(true);
    // Simulate QR scan - in real app this would open camera scanner
    setTimeout(() => {
      handleAttendanceSubmission(session.id, 'teacher@example.com');
      setShowScanner(false);
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/logout');
  };

  if (isLoading) {
    return (
      <div className="student-dashboard">
        <Nav pageTitle="Student Dashboard" userType="student" />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!studentData || !studentData.profileComplete) {
    return (
      <div className="student-dashboard">
        <Nav pageTitle="Student Dashboard" userType="student" />
        <div className="profile-setup-container">
          <div className="profile-setup-card">
            <h1>Welcome to EduAttend!</h1>
            <p>Complete your student profile to access the attendance system.</p>
            
            <div className="setup-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Complete Profile</h3>
                  <p>Add your student details and information</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Join Classes</h3>
                  <p>Enroll in your courses to start tracking attendance</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Scan QR Codes</h3>
                  <p>Mark your attendance by scanning QR codes in class</p>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button 
                className="complete-profile-btn"
                onClick={() => navigate('/student-form')}
              >
                Complete Your Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <Nav pageTitle="Student Dashboard" userType="student" />
      
      <div className="dashboard-content">
        {/* Attendance Message */}
        {attendanceMessage && (
          <div className={`attendance-message ${
            attendanceMessage.includes('✅') ? 'success' : 
            attendanceMessage.includes('❌') ? 'error' : 'warning'
          }`}>
            {attendanceMessage}
          </div>
        )}

        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome back, {studentData.name}!</h1>
          <p>Track your attendance and stay connected with your classes</p>
        </div>

        {/* Active Sessions Section */}
        <div className="sections-container">
          <div className="section active-sessions">
            <h2>📚 Active Sessions</h2>
            {activeSessions.length > 0 ? (
              <div className="sessions-grid">
                {activeSessions.map(session => (
                  <div key={session.id} className="session-card">
                    <div className="session-header">
                      <h3>{session.courseName}</h3>
                      <span className="session-status active">● Active</span>
                    </div>
                    <div className="session-details">
                      <p><strong>Teacher:</strong> {session.teacherName}</p>
                      <p><strong>Time:</strong> {session.time}</p>
                      <p><strong>Room:</strong> {session.room}</p>
                    </div>
                    <button 
                      className="scan-btn"
                      onClick={() => handleScanQR(session)}
                    >
                      📱 Scan QR Code
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-sessions">
                <div className="no-sessions-icon">📝</div>
                <h3>No Active Sessions</h3>
                <p>No teachers have created sessions at this time. Check back when classes are in session.</p>
              </div>
            )}
          </div>

          {/* Attendance History Section */}
          <div className="section attendance-history">
            <h2>📊 Attendance History</h2>
            {attendanceHistory.length > 0 ? (
              <div className="history-list">
                {attendanceHistory.map(record => (
                  <div key={record.id} className="history-item">
                    <div className="history-info">
                      <h4>Session: {record.sessionId}</h4>
                      <p>Teacher: {record.teacherEmail}</p>
                      <p>Date: {record.date} at {record.time}</p>
                    </div>
                    <div className="history-status present">
                      ✅ {record.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-history">
                <div className="no-history-icon">📈</div>
                <p>No attendance records yet. Start marking attendance to see your history here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="dashboard-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="scanner-modal">
          <div className="scanner-content">
            <h3>📱 Scanning QR Code...</h3>
            <div className="scanner-animation">
              <div className="scan-line"></div>
            </div>
            <p>Position the QR code within the frame</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
