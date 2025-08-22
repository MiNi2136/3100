import React, { useEffect, useState } from "react";
import api from "../api";
import "../styles/Dashboard.css";
import "../styles/TeacherDashboard.css";
import { useNavigate } from "react-router-dom";
import NewSession from "./NewSession";
import SessionDetails from "./SessionDetails";
import Nav from "./Nav";

const TeacherDashboard = () => {
  console.log("✅ CORRECT TeacherDashboard component loaded with Schedule functionality - Sample data removed!");
  
  // Clear any existing sample data immediately
  useEffect(() => {
    localStorage.removeItem('teacherScheduleEvents');
    localStorage.removeItem('teacherAttendanceRecords'); // Also clear attendance sample data
    console.log("🧹 Cleared localStorage for fresh start");
  }, []);
  
  //eslint-disable-next-line
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [sessionList, setSessionList] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSessionDisplay, setSessionDisplay] = useState(false);
  const [currentSession, setCurrentSession] = useState("");
  
  // Schedule Calendar states
  const [scheduleEvents, setScheduleEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentView, setCurrentView] = useState('month'); // month, week, day
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'class', // class, task, reminder
    description: '',
    classroom: '',
    subject: '',
    color: '#667eea'
  });
  
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    courseCode: '',
    description: '',
    credits: '',
    department: '',
    semester: '',
    maxStudents: '',
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
      classroom: ''
    }
  });
  const navigate = useNavigate();

  // Reports state variables
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [reportFilters, setReportFilters] = useState({
    class: 'all',
    section: 'all',
    rollNumber: '',
    dateFrom: '',
    dateTo: '',
    subject: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load available courses on mount
  useEffect(() => {
    const savedCourses = localStorage.getItem('teacherCourses');
    if (savedCourses) {
      setAvailableCourses(JSON.parse(savedCourses));
    }
  }, []);

  // Save courses to localStorage
  useEffect(() => {
    localStorage.setItem('teacherCourses', JSON.stringify(availableCourses));
  }, [availableCourses]);

  // Load schedule events on mount
  useEffect(() => {
    // First, clear any existing sample data from localStorage
    localStorage.removeItem('teacherScheduleEvents');
    
    const savedEvents = localStorage.getItem('teacherScheduleEvents');
    if (savedEvents) {
      try {
        const events = JSON.parse(savedEvents);
        // Filter out any sample/demo data
        const cleanEvents = events.filter(event => 
          !event.title.includes('Mathematics') && 
          !event.title.includes('Physics') && 
          !event.title.includes('Chemistry') &&
          !event.title.includes('Grade Math assignments') &&
          !event.title.includes('Prepare Physics lab') &&
          !event.title.includes('Review chemistry')
        );
        setScheduleEvents(cleanEvents);
        // Update localStorage with cleaned data
        if (cleanEvents.length !== events.length) {
          localStorage.setItem('teacherScheduleEvents', JSON.stringify(cleanEvents));
        }
      } catch (error) {
        console.error('Error parsing saved events:', error);
        setScheduleEvents([]);
        localStorage.removeItem('teacherScheduleEvents');
      }
    } else {
      // Initialize with empty schedule
      setScheduleEvents([]);
    }
  }, []);

  // Save schedule events to localStorage
  useEffect(() => {
    localStorage.setItem('teacherScheduleEvents', JSON.stringify(scheduleEvents));
  }, [scheduleEvents]);

  // Load attendance records on mount
  useEffect(() => {
    // Clear any existing sample/demo data first
    const savedRecords = localStorage.getItem('teacherAttendanceRecords');
    if (savedRecords) {
      try {
        const records = JSON.parse(savedRecords);
        // Filter out any sample data - keep only real attendance records
        const realRecords = records.filter(record => 
          !record.isDemo && // Remove demo data flag
          record.source !== 'demo' && // Remove demo source
          !record.studentName?.includes('John Smith') && // Remove specific demo names
          !record.studentName?.includes('Emma Johnson')
        );
        setAttendanceRecords(realRecords);
        setFilteredRecords(realRecords);
        
        // Update localStorage with cleaned data
        if (realRecords.length !== records.length) {
          localStorage.setItem('teacherAttendanceRecords', JSON.stringify(realRecords));
        }
      } catch (error) {
        console.error('Error parsing attendance records:', error);
        setAttendanceRecords([]);
        setFilteredRecords([]);
        localStorage.removeItem('teacherAttendanceRecords');
      }
    } else {
      // Initialize with empty records - no automatic sample data
      setAttendanceRecords([]);
      setFilteredRecords([]);
    }
  }, []);

  //update list of sessions
  const updateList = async () => {
    try {
      console.log("Attempting to update session list...");
      const response = await api.post(
        "/sessions/getSessions",
        {
          token: token,
        }
      );
      console.log("Session list updated successfully:", response.data);
      setSessionList(response.data.sessions);
    } catch (err) {
      console.error("Error updating session list:", err);
      // Don't throw error, just log it to prevent crashes
    }
  };

  const toggleSessionDetails = (e) => {
    //get the session details that has session_id = e
    setCurrentSession(
      sessionList.filter((session) => {
        return session.session_id === e;
      })
    );
    setSessionDisplay(!isSessionDisplay);
  };

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  // Function to create new course
  const handleCreateCourse = () => {
    if (!newCourse.courseName || !newCourse.courseCode || !newCourse.department) {
      alert('Please fill in all required fields');
      return;
    }

    const courseWithId = {
      id: Date.now(),
      ...newCourse,
      teacherName: localStorage.getItem('name') || 'Teacher',
      teacherEmail: localStorage.getItem('email'),
      enrolledStudents: [],
      createdAt: new Date().toISOString(),
      isActive: true
    };

    setAvailableCourses(prev => [...prev, courseWithId]);
    setShowCreateCourseModal(false);
    setNewCourse({
      courseName: '',
      courseCode: '',
      description: '',
      credits: '',
      department: '',
      semester: '',
      maxStudents: '',
      schedule: {
        days: [],
        startTime: '',
        endTime: '',
        classroom: ''
      }
    });
    
    // Also save to global courses list for students
    const globalCourses = JSON.parse(localStorage.getItem('globalAvailableCourses') || '[]');
    globalCourses.push(courseWithId);
    localStorage.setItem('globalAvailableCourses', JSON.stringify(globalCourses));
    
    alert('Course created successfully and is now available for student enrollment!');
  };

  // Function to handle day selection
  const handleDayToggle = (day) => {
    const updatedDays = newCourse.schedule.days.includes(day)
      ? newCourse.schedule.days.filter(d => d !== day)
      : [...newCourse.schedule.days, day];
    
    setNewCourse(prev => ({
      ...prev,
      schedule: { ...prev.schedule, days: updatedDays }
    }));
  };

  // Function to delete course
  const handleDeleteCourse = (courseId) => {
    setAvailableCourses(prev => prev.filter(course => course.id !== courseId));
    
    // Also remove from global courses list
    const globalCourses = JSON.parse(localStorage.getItem('globalAvailableCourses') || '[]');
    const updatedGlobal = globalCourses.filter(course => course.id !== courseId);
    localStorage.setItem('globalAvailableCourses', JSON.stringify(updatedGlobal));
  };

  // Schedule Calendar Functions
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const calendarDays = [];
    
    // Add empty cells for previous month days
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day));
    }
    
    return calendarDays;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return scheduleEvents.filter(event => event.date === dateString);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime) {
      alert('Please fill in all required fields');
      return;
    }

    const eventWithId = {
      id: Date.now(),
      ...newEvent,
      createdAt: new Date().toISOString()
    };

    setScheduleEvents(prev => [...prev, eventWithId]);
    setShowEventModal(false);
    setShowTaskModal(false);
    setNewEvent({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'class',
      description: '',
      classroom: '',
      subject: '',
      color: '#667eea'
    });
  };

  const handleDeleteEvent = (eventId) => {
    setScheduleEvents(prev => prev.filter(event => event.id !== eventId));
  };

  // Function to clear all sample/demo data
  const clearSampleData = () => {
    if (window.confirm('This will clear all sample data and reset your schedule. Are you sure?')) {
      // Clear all events from state
      setScheduleEvents([]);
      // Clear localStorage completely
      localStorage.removeItem('teacherScheduleEvents');
      // Show confirmation
      alert('Schedule cleared successfully! You can now add your own classes.');
    }
  };

  // Function to reset entire schedule
  const resetSchedule = () => {
    if (window.confirm('This will delete ALL your schedule data including classes, tasks, and reminders. This action cannot be undone. Are you sure?')) {
      setScheduleEvents([]);
      localStorage.removeItem('teacherScheduleEvents');
      alert('Schedule has been completely reset!');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const navigateMonth = (direction) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log("Token effect triggered, token:", token);
    if (token === "" || token === undefined) {
      console.log("No token found, redirecting to login");
      navigate("/login");
    } else {
      console.log("Token found, updating list");
      updateList();
      try {
        const logoutElement = document.querySelector(".logout");
        if (logoutElement) {
          logoutElement.style.display = "block";
        }
      } catch (err) {
        console.error("Error setting logout display:", err);
      }
    }
  }, [token]);

  const FlashCard = ({ session }) => {
    return (
      <div
        className="flashcard"
        onClick={() => toggleSessionDetails(session.session_id)}
      >
        <div className="front">
          <h4>{session.name}</h4>
        </div>
      </div>
    );
  };

  // Dashboard Tab Content
  const renderDashboardTab = () => (
    <div className="dashboard-content">
      <div className="teacher-overview">
        <div className="overview-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{sessionList.length}</h3>
              <p>Active Sessions</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <h3>{availableCourses.length}</h3>
              <p>Available Courses</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{availableCourses.reduce((total, course) => total + course.enrolledStudents.length, 0)}</h3>
              <p>Enrolled Students</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h3>Recent Sessions</h3>
          {sessionList.length > 0 ? (
            <div className="session-grid">
              {sessionList.slice(0, 3).map((session, index) => (
                <div key={index + session.session_id} className="session-card">
                  <FlashCard session={session} />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-sessions">
              <div className="no-sessions-icon">📊</div>
              <h4>No sessions created yet</h4>
              <p>Start by creating your first session using the QR Generator.</p>
            </div>
          )}
        </div>

        <div className="section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button 
              className="action-btn primary"
              onClick={() => setActiveTab('qr-generator')}
            >
              ⚡ Create Session
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => setActiveTab('courses')}
            >
              📚 Manage Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // QR Generator Tab (Session Creation)
  const renderQRGeneratorTab = () => (
    <div className="qr-generator-content">
      <div className="qr-header">
        <h3>🎯 QR Generator - Session Management</h3>
        <p>Create and manage attendance sessions for your courses</p>
      </div>

      <div className="generator-sections">
        <div className="section">
          <div className="section-header">
            <h4>Create New Session</h4>
            <button 
              className="action-btn primary"
              onClick={togglePopup}
            >
              ➕ New Session
            </button>
          </div>
          
          <div className="session-list-container">
            <h4>Your Active Sessions</h4>
            {sessionList.length > 0 ? (
              <div className="sessions-grid">
                {sessionList.map((session, index) => (
                  <div
                    key={index + session.session_id}
                    className="session-card clickable"
                    onClick={() => toggleSessionDetails(session.session_id)}
                  >
                    <div className="session-info">
                      <h5>{session.name}</h5>
                      <p className="session-meta">Session ID: {session.session_id}</p>
                      <div className="session-actions">
                        <span className="session-status active">🟢 Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-sessions">
                <div className="no-sessions-icon">🎯</div>
                <h4>No active sessions</h4>
                <p>Create your first session to start generating QR codes for attendance.</p>
                <button 
                  className="action-btn primary"
                  onClick={togglePopup}
                >
                  ➕ Create First Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Courses Tab (Course Management) - Production Ready
  const renderCoursesTab = () => (
    <div className="courses-tab">
      <div className="courses-header">
        {/* Stats Cards Row */}
        <div className="courses-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-number">{availableCourses.length}</div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-number">{availableCourses.filter(c => c.isActive).length}</div>
            <div className="stat-label">Active Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-number">
              {availableCourses.reduce((total, course) => total + (course.enrolledStudents?.length || 0), 0)}
            </div>
            <div className="stat-label">Total Enrollments</div>
          </div>
        </div>
      </div>

      {/* Button Section - Separate Container */}
      <div className="courses-button-section">
        <button 
          className="create-course-btn"
          onClick={() => setShowCreateCourseModal(true)}
        >
          <span className="btn-icon">➕</span>
          <span className="btn-text">Create New Course</span>
        </button>
      </div>

      <div className="courses-content">
        {availableCourses.length === 0 ? (
          <div className="no-courses">
            <div className="no-courses-icon">📚</div>
            <h3>No Courses Created Yet</h3>
            <p>Create your first course to get started. Students will be able to see and enroll in courses you create.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {availableCourses.map(course => (
              <div key={course.id} className={`course-card ${!course.isActive ? 'inactive' : ''}`}>
                <div className="course-card-header">
                  <div className="course-title-section">
                    <h4 className="course-title">{course.courseName}</h4>
                    <span className="course-code">{course.courseCode}</span>
                  </div>
                  <div className="course-status-section">
                    <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                      {course.isActive ? (
                        <>
                          <span className="status-dot active"></span>
                          Active
                        </>
                      ) : (
                        <>
                          <span className="status-dot inactive"></span>
                          Inactive
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="course-card-body">
                  {course.description && (
                    <p className="course-description">{course.description}</p>
                  )}
                  
                  <div className="course-info-grid">
                    <div className="info-item">
                      <div className="info-label">Department</div>
                      <div className="info-value">{course.department || 'General'}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Credits</div>
                      <div className="info-value">{course.credits || 'N/A'}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Semester</div>
                      <div className="info-value">{course.semester || 'N/A'}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Enrolled</div>
                      <div className="info-value">
                        <span className="enrollment-count">
                          {course.enrolledStudents?.length || 0}
                        </span>
                        {course.maxStudents && (
                          <span className="enrollment-max">/{course.maxStudents}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {course.schedule && course.schedule.days && course.schedule.days.length > 0 && (
                    <div className="course-schedule">
                      <div className="schedule-header">
                        <span className="schedule-icon">📅</span>
                        <span className="schedule-title">Schedule</span>
                      </div>
                      <div className="schedule-details">
                        <div className="schedule-days">{course.schedule.days.join(', ')}</div>
                        <div className="schedule-time">
                          {course.schedule.startTime} - {course.schedule.endTime}
                        </div>
                        {course.schedule.classroom && (
                          <div className="schedule-room">📍 {course.schedule.classroom}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="course-card-footer">
                  <div className="course-actions">
                    <button 
                      className="action-btn view-students"
                      onClick={() => {
                        const enrolledList = course.enrolledStudents?.length > 0 
                          ? course.enrolledStudents.map(s => s.name || s).join('\n• ') 
                          : 'No students enrolled yet';
                        alert(`📋 Enrolled Students in "${course.courseName}":\n\n• ${enrolledList}`);
                      }}
                      title="View enrolled students"
                    >
                      <span className="btn-icon">👥</span>
                      <span className="btn-text">Students ({course.enrolledStudents?.length || 0})</span>
                    </button>
                    
                    <button 
                      className={`action-btn toggle-status ${course.isActive ? 'deactivate' : 'activate'}`}
                      onClick={() => toggleCourseStatus(course.id)}
                      title={course.isActive ? 'Deactivate course' : 'Activate course'}
                    >
                      <span className="btn-icon">{course.isActive ? '⏸️' : '▶️'}</span>
                      <span className="btn-text">{course.isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>
                    
                    <button 
                      className="action-btn delete-course"
                      onClick={() => handleDeleteCourse(course.id)}
                      title="Delete course"
                    >
                      <span className="btn-icon">🗑️</span>
                      <span className="btn-text">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Add missing course management functions
  const toggleCourseStatus = (courseId) => {
    const updatedCourses = availableCourses.map(course => 
      course.id === courseId 
        ? { ...course, isActive: !course.isActive }
        : course
    );
    setAvailableCourses(updatedCourses);
    localStorage.setItem('teacher_available_courses', JSON.stringify(updatedCourses));
  };

  // Schedule Calendar Tab
  const renderScheduleTab = () => (
    <div className="schedule-content">
      <div className="schedule-header">
        <div className="schedule-controls">
          <div className="view-controls">
            <button 
              className={`view-btn ${currentView === 'month' ? 'active' : ''}`}
              onClick={() => setCurrentView('month')}
            >
              📅 Month
            </button>
            <button 
              className={`view-btn ${currentView === 'week' ? 'active' : ''}`}
              onClick={() => setCurrentView('week')}
            >
              📋 Week
            </button>
            <button 
              className={`view-btn ${currentView === 'day' ? 'active' : ''}`}
              onClick={() => setCurrentView('day')}
            >
              📝 Day
            </button>
          </div>
          
          <div className="calendar-navigation">
            <button className="nav-btn" onClick={() => navigateMonth(-1)}>
              ◀️ Previous
            </button>
            <h3 className="current-month">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button className="nav-btn" onClick={() => navigateMonth(1)}>
              Next ▶️
            </button>
          </div>
          
          <div className="add-controls">
            <button 
              className="action-btn primary"
              onClick={() => {
                setNewEvent({
                  ...newEvent,
                  type: 'class',
                  date: selectedDate.toISOString().split('T')[0]
                });
                setShowEventModal(true);
              }}
            >
              ➕ Add Class
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => {
                setNewEvent({
                  ...newEvent,
                  type: 'task',
                  date: selectedDate.toISOString().split('T')[0]
                });
                setShowTaskModal(true);
              }}
            >
              📋 Add Task
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => {
                setNewEvent({
                  ...newEvent,
                  type: 'reminder',
                  date: selectedDate.toISOString().split('T')[0]
                });
                setShowTaskModal(true);
              }}
            >
              🔔 Add Reminder
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {currentView === 'month' && (
        <div className="calendar-container">
          <div className="calendar-header">
            <div className="calendar-weekday">Sunday</div>
            <div className="calendar-weekday">Monday</div>
            <div className="calendar-weekday">Tuesday</div>
            <div className="calendar-weekday">Wednesday</div>
            <div className="calendar-weekday">Thursday</div>
            <div className="calendar-weekday">Friday</div>
            <div className="calendar-weekday">Saturday</div>
          </div>
          
          <div className="calendar-grid">
            {generateCalendarDays(selectedDate).map((date, index) => (
              <div 
                key={index} 
                className={`calendar-day ${!date ? 'empty' : ''} ${
                  date && date.toDateString() === new Date().toDateString() ? 'today' : ''
                }`}
                onClick={() => date && setSelectedDate(date)}
              >
                {date && (
                  <>
                    <div className="day-number">{date.getDate()}</div>
                    <div className="day-events">
                      {getEventsForDate(date).slice(0, 3).map(event => (
                        <div 
                          key={event.id} 
                          className={`event-indicator ${event.type}`}
                          style={{ backgroundColor: event.color }}
                          title={`${event.title} - ${formatTime(event.startTime)}`}
                        >
                          {event.type === 'class' && '📚'}
                          {event.type === 'task' && '📋'}
                          {event.type === 'reminder' && '🔔'}
                          <span className="event-title">{event.title}</span>
                        </div>
                      ))}
                      {getEventsForDate(date).length > 3 && (
                        <div className="more-events">
                          +{getEventsForDate(date).length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day/Week View */}
      {(currentView === 'day' || currentView === 'week') && (
        <div className="schedule-view">
          <div className="selected-date-header">
            <h3>{selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</h3>
            <div className="quick-actions">
              <button 
                className="quick-add-btn"
                onClick={() => {
                  setNewEvent({
                    ...newEvent,
                    type: 'class',
                    date: selectedDate.toISOString().split('T')[0]
                  });
                  setShowEventModal(true);
                }}
              >
                ➕ Add Class
              </button>
              <button 
                className="clear-sample-btn"
                onClick={clearSampleData}
                title="Clear all sample/demo data"
              >
                🧹 Clear Sample Data
              </button>
              <button 
                className="reset-schedule-btn"
                onClick={resetSchedule}
                title="Reset entire schedule (delete all data)"
              >
                🗑️ Reset All
              </button>
            </div>
          </div>
          
          {/* Today's Classes Section */}
          {selectedDate.toDateString() === new Date().toDateString() && (
            <div className="todays-classes">
              <h4>🕐 Today's Classes</h4>
              <div className="classes-grid">
                {getEventsForDate(selectedDate)
                  .filter(event => event.type === 'class')
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(event => (
                    <div key={event.id} className="class-card">
                      <div className="class-time">
                        {formatTime(event.startTime)}
                        {event.endTime && `-${formatTime(event.endTime)}`}
                      </div>
                      <div className="class-info">
                        <h5>{event.title}</h5>
                        {event.subject && <p><strong>Subject:</strong> {event.subject}</p>}
                        {event.classroom && <p><strong>Room:</strong> {event.classroom}</p>}
                      </div>
                      <div className="class-actions">
                        <button 
                          className="complete-btn"
                          onClick={() => console.log('Class completed')}
                          title="Mark as completed"
                        >
                          ✅
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => {
                            if (window.confirm(`Delete "${event.title}"?`)) {
                              handleDeleteEvent(event.id);
                            }
                          }}
                          title="Delete class"
                        >
                          �️
                        </button>
                      </div>
                    </div>
                  ))}
                
                {getEventsForDate(selectedDate).filter(event => event.type === 'class').length === 0 && (
                  <div className="no-classes">
                    <p>No classes scheduled for today.</p>
                    <button 
                      className="add-first-class-btn"
                      onClick={() => {
                        setNewEvent({
                          ...newEvent,
                          type: 'class',
                          date: selectedDate.toISOString().split('T')[0]
                        });
                        setShowEventModal(true);
                      }}
                    >
                      ➕ Add Your First Class
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* All Events List */}
          <div className="all-events-section">
            <h4>📝 Tasks & Reminders</h4>
            <div className="events-list">
              {getEventsForDate(selectedDate).filter(event => event.type !== 'class').length > 0 ? (
                getEventsForDate(selectedDate)
                  .filter(event => event.type !== 'class')
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(event => (
                    <div key={event.id} className={`event-card ${event.type}`}>
                      <div className="event-time">
                        <div className="event-icon">
                          {event.type === 'task' && '📋'}
                          {event.type === 'reminder' && '🔔'}
                        </div>
                        <div className="time-info">
                          <div className="start-time">{formatTime(event.startTime)}</div>
                        </div>
                      </div>
                      
                      <div className="event-details">
                        <h4>{event.title}</h4>
                        {event.description && <p>{event.description}</p>}
                        {event.priority && (
                          <span className={`priority ${event.priority}`}>
                            {event.priority}
                          </span>
                        )}
                      </div>
                      
                      <div className="event-actions">
                        <button 
                          className="delete-event-btn"
                          onClick={() => {
                            if (window.confirm(`Delete "${event.title}"?`)) {
                              handleDeleteEvent(event.id);
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="no-tasks">
                  <p>No tasks or reminders for this day.</p>
                  <div className="add-task-buttons">
                    <button 
                      className="add-task-btn"
                      onClick={() => {
                        setNewEvent({
                          ...newEvent,
                          type: 'task',
                          date: selectedDate.toISOString().split('T')[0]
                        });
                        setShowTaskModal(true);
                      }}
                    >
                      📋 Add Task
                    </button>
                    <button 
                      className="add-reminder-btn"
                      onClick={() => {
                        setNewEvent({
                          ...newEvent,
                          type: 'reminder',
                          date: selectedDate.toISOString().split('T')[0]
                        });
                        setShowTaskModal(true);
                      }}
                    >
                      🔔 Add Reminder
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Generate sample attendance data
  const generateSampleAttendanceData = () => {
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
    const classes = ['10A', '10B', '11A', '11B', '12A', '12B'];
    const sections = ['A', 'B'];
    const students = [
      'John Smith', 'Emma Johnson', 'Michael Brown', 'Sarah Davis', 'James Wilson',
      'Emily Taylor', 'David Anderson', 'Jessica Thomas', 'Robert Jackson', 'Ashley White'
    ];
    
    const attendanceRecords = [];
    const today = new Date();
    
    // Generate records for the last 30 days
    for (let i = 0; i < 30; i++) {
      const recordDate = new Date(today);
      recordDate.setDate(today.getDate() - i);
      
      // Generate 2-3 classes per day
      const classesPerDay = Math.floor(Math.random() * 2) + 2;
      
      for (let j = 0; j < classesPerDay; j++) {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const classSection = classes[Math.floor(Math.random() * classes.length)];
        const section = sections[Math.floor(Math.random() * sections.length)];
        
        // Generate attendance for 5-8 students per class
        const studentsInClass = Math.floor(Math.random() * 4) + 5;
        const selectedStudents = students.sort(() => 0.5 - Math.random()).slice(0, studentsInClass);
        
        selectedStudents.forEach((student, index) => {
          attendanceRecords.push({
            id: `demo_${recordDate.getTime()}_${j}_${index}`,
            date: recordDate.toISOString().split('T')[0],
            time: `${8 + j}:${Math.floor(Math.random() * 6)}0 AM`,
            subject: subject,
            class: classSection,
            section: section,
            studentName: student,
            rollNumber: `${classSection}-${String(index + 1).padStart(3, '0')}`,
            status: Math.random() > 0.2 ? 'Present' : 'Absent', // 80% present, 20% absent
            remarks: Math.random() > 0.8 ? 'Late arrival' : '',
            isDemo: true, // Mark as demo data
            source: 'demo' // Mark source as demo
          });
        });
      }
    }
    
    return attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Add real attendance record (for future QR code integration)
  const addAttendanceRecord = (attendanceData) => {
    const newRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: attendanceData.date || new Date().toISOString().split('T')[0],
      time: attendanceData.time || new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      subject: attendanceData.subject,
      class: attendanceData.class,
      section: attendanceData.section,
      studentName: attendanceData.studentName,
      rollNumber: attendanceData.rollNumber,
      status: attendanceData.status || 'Present',
      remarks: attendanceData.remarks || '',
      source: 'qr-code', // Mark as real data
      timestamp: Date.now()
    };
    
    const updatedRecords = [...attendanceRecords, newRecord];
    setAttendanceRecords(updatedRecords);
    setFilteredRecords(updatedRecords);
    localStorage.setItem('teacherAttendanceRecords', JSON.stringify(updatedRecords));
    
    console.log('✅ New attendance record added:', newRecord);
  };

  // Filter attendance records
  const applyFilters = () => {
    let filtered = [...attendanceRecords];
    
    if (reportFilters.class !== 'all') {
      filtered = filtered.filter(record => record.class === reportFilters.class);
    }
    
    if (reportFilters.section !== 'all') {
      filtered = filtered.filter(record => record.section === reportFilters.section);
    }
    
    if (reportFilters.rollNumber.trim() !== '') {
      filtered = filtered.filter(record => 
        record.rollNumber.toLowerCase().includes(reportFilters.rollNumber.toLowerCase())
      );
    }
    
    if (reportFilters.subject !== 'all') {
      filtered = filtered.filter(record => record.subject === reportFilters.subject);
    }
    
    if (reportFilters.dateFrom) {
      filtered = filtered.filter(record => record.date >= reportFilters.dateFrom);
    }
    
    if (reportFilters.dateTo) {
      filtered = filtered.filter(record => record.date <= reportFilters.dateTo);
    }
    
    setFilteredRecords(filtered);
  };

  // Export to PDF function
  const exportToPDF = () => {
    // Create a simple HTML structure for PDF generation
    const printContent = `
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .filters { margin-bottom: 20px; padding: 15px; background: #f5f5f5; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #667eea; color: white; }
            .present { color: #28a745; font-weight: bold; }
            .absent { color: #dc3545; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Attendance Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="filters">
            <h3>Applied Filters:</h3>
            <p><strong>Class:</strong> ${reportFilters.class === 'all' ? 'All Classes' : reportFilters.class}</p>
            <p><strong>Section:</strong> ${reportFilters.section === 'all' ? 'All Sections' : reportFilters.section}</p>
            <p><strong>Subject:</strong> ${reportFilters.subject === 'all' ? 'All Subjects' : reportFilters.subject}</p>
            ${reportFilters.rollNumber ? `<p><strong>Roll Number:</strong> ${reportFilters.rollNumber}</p>` : ''}
            ${reportFilters.dateFrom ? `<p><strong>From Date:</strong> ${reportFilters.dateFrom}</p>` : ''}
            ${reportFilters.dateTo ? `<p><strong>To Date:</strong> ${reportFilters.dateTo}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Section</th>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map(record => `
                <tr>
                  <td>${new Date(record.date).toLocaleDateString()}</td>
                  <td>${record.time}</td>
                  <td>${record.subject}</td>
                  <td>${record.class}</td>
                  <td>${record.section}</td>
                  <td>${record.studentName}</td>
                  <td>${record.rollNumber}</td>
                  <td class="${record.status.toLowerCase()}">${record.status}</td>
                  <td>${record.remarks}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 30px; text-align: center;">
            <p><strong>Total Records: ${filteredRecords.length}</strong></p>
            <p><strong>Present: ${filteredRecords.filter(r => r.status === 'Present').length}</strong></p>
            <p><strong>Absent: ${filteredRecords.filter(r => r.status === 'Absent').length}</strong></p>
          </div>
        </body>
      </html>
    `;
    
    // Open print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Render Reports Tab
  const renderReportsTab = () => (
    <div className="reports-tab">
      <div className="reports-header">
        <h3>Attendance Reports</h3>
        <p>View, filter, and export attendance records for all classes</p>
        
        <div className="reports-actions">
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button 
            className="export-btn"
            onClick={exportToPDF}
            disabled={filteredRecords.length === 0}
          >
            📄 Export PDF
          </button>
          {attendanceRecords.some(record => record.isDemo || record.source === 'demo') && (
            <button 
              className="clear-demo-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all demo data? This will only remove test data, not real attendance records.')) {
                  const realRecords = attendanceRecords.filter(record => !record.isDemo && record.source !== 'demo');
                  setAttendanceRecords(realRecords);
                  setFilteredRecords(realRecords);
                  localStorage.setItem('teacherAttendanceRecords', JSON.stringify(realRecords));
                  alert(`Cleared demo data. ${realRecords.length} real records remain.`);
                }
              }}
            >
              🧹 Clear Demo Data
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="class-filter">Class:</label>
              <select 
                id="class-filter"
                value={reportFilters.class}
                onChange={(e) => setReportFilters({...reportFilters, class: e.target.value})}
              >
                <option value="all">All Classes</option>
                <option value="10A">10A</option>
                <option value="10B">10B</option>
                <option value="11A">11A</option>
                <option value="11B">11B</option>
                <option value="12A">12A</option>
                <option value="12B">12B</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="section-filter">Section:</label>
              <select 
                id="section-filter"
                value={reportFilters.section}
                onChange={(e) => setReportFilters({...reportFilters, section: e.target.value})}
              >
                <option value="all">All Sections</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="subject-filter">Subject:</label>
              <select 
                id="subject-filter"
                value={reportFilters.subject}
                onChange={(e) => setReportFilters({...reportFilters, subject: e.target.value})}
              >
                <option value="all">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="roll-filter">Roll Number:</label>
              <input 
                type="text"
                id="roll-filter"
                placeholder="Enter roll number..."
                value={reportFilters.rollNumber}
                onChange={(e) => setReportFilters({...reportFilters, rollNumber: e.target.value})}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="date-from">From Date:</label>
              <input 
                type="date"
                id="date-from"
                value={reportFilters.dateFrom}
                onChange={(e) => setReportFilters({...reportFilters, dateFrom: e.target.value})}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="date-to">To Date:</label>
              <input 
                type="date"
                id="date-to"
                value={reportFilters.dateTo}
                onChange={(e) => setReportFilters({...reportFilters, dateTo: e.target.value})}
              />
            </div>
          </div>
          
          <div className="filter-actions">
            <button 
              className="apply-filters-btn"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setReportFilters({
                  class: 'all',
                  section: 'all',
                  rollNumber: '',
                  dateFrom: '',
                  dateTo: '',
                  subject: 'all'
                });
                setFilteredRecords(attendanceRecords);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="attendance-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-header">
              <h4>Total Records</h4>
              <span className="card-icon">📊</span>
            </div>
            <div className="card-value">{filteredRecords.length}</div>
          </div>
          
          <div className="summary-card present">
            <div className="card-header">
              <h4>Present</h4>
              <span className="card-icon">✅</span>
            </div>
            <div className="card-value">
              {filteredRecords.filter(r => r.status === 'Present').length}
            </div>
            <div className="card-percentage">
              {filteredRecords.length > 0 
                ? Math.round((filteredRecords.filter(r => r.status === 'Present').length / filteredRecords.length) * 100)
                : 0}%
            </div>
          </div>
          
          <div className="summary-card absent">
            <div className="card-header">
              <h4>Absent</h4>
              <span className="card-icon">❌</span>
            </div>
            <div className="card-value">
              {filteredRecords.filter(r => r.status === 'Absent').length}
            </div>
            <div className="card-percentage">
              {filteredRecords.length > 0 
                ? Math.round((filteredRecords.filter(r => r.status === 'Absent').length / filteredRecords.length) * 100)
                : 0}%
            </div>
          </div>
        </div>
      </div>

      <div className="attendance-table-container">
        {filteredRecords.length === 0 ? (
          <div className="no-records">
            <div className="no-records-icon">📋</div>
            <h3>No Records Found</h3>
            <p>
              {attendanceRecords.length === 0 
                ? "No attendance records available yet. Once you conduct classes and students submit attendance via QR codes, the records will appear here automatically."
                : "No records match your current filters. Try adjusting the filter criteria."
              }
            </p>
            {attendanceRecords.length === 0 && (
              <button 
                className="add-sample-data-btn"
                onClick={() => {
                  const sampleData = generateSampleAttendanceData();
                  setAttendanceRecords(sampleData);
                  setFilteredRecords(sampleData);
                  localStorage.setItem('teacherAttendanceRecords', JSON.stringify(sampleData));
                  alert('Demo data generated for testing purposes. This will be replaced with real attendance data.');
                }}
              >
                🎯 Generate Demo Data (for testing)
              </button>
            )}
          </div>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className={`${record.status.toLowerCase()} ${record.isDemo || record.source === 'demo' ? 'demo-record' : ''}`}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.time}</td>
                    <td>
                      {record.subject}
                      {(record.isDemo || record.source === 'demo') && (
                        <span className="demo-badge">Demo</span>
                      )}
                    </td>
                    <td>{record.class}</td>
                    <td>{record.section}</td>
                    <td>{record.studentName}</td>
                    <td>{record.rollNumber}</td>
                    <td>
                      <span className={`status-badge ${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="teacher-dashboard">
      <Nav />
      
      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <h2>{sidebarCollapsed ? 'TD' : 'Teacher Dashboard'}</h2>
            <button 
              className="collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? '▶' : '◀'}
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
              <li className={activeTab === 'qr-generator' ? 'active' : ''}>
                <button onClick={() => setActiveTab('qr-generator')}>
                  <span className="nav-icon">🎯</span>
                  {!sidebarCollapsed && <span className="nav-text">QR Generator</span>}
                </button>
              </li>
              <li className={activeTab === 'courses' ? 'active' : ''}>
                <button onClick={() => setActiveTab('courses')}>
                  <span className="nav-icon">📚</span>
                  {!sidebarCollapsed && <span className="nav-text">Courses</span>}
                </button>
              </li>
              <li className={activeTab === 'schedule' ? 'active' : ''}>
                <button onClick={() => setActiveTab('schedule')}>
                  <span className="nav-icon">📅</span>
                  {!sidebarCollapsed && <span className="nav-text">Schedule</span>}
                </button>
              </li>
              <li className={activeTab === 'reports' ? 'active' : ''}>
                <button onClick={() => setActiveTab('reports')}>
                  <span className="nav-icon">📊</span>
                  {!sidebarCollapsed && <span className="nav-text">Reports</span>}
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

        {/* Main Content Area */}
        <div className="main-content">
          <div className="content-header">
            <h1>
              {activeTab === 'dashboard' && 'Teacher Dashboard'}
              {activeTab === 'qr-generator' && 'QR Generator'}
              {activeTab === 'courses' && 'Course Management'}
              {activeTab === 'schedule' && 'Schedule Calendar'}
              {activeTab === 'reports' && 'Attendance Reports'}
            </h1>
          </div>
          
          <div className="tab-content">
            {(() => {
              switch (activeTab) {
                case 'dashboard': return renderDashboardTab();
                case 'qr-generator': return renderQRGeneratorTab();
                case 'courses': return renderCoursesTab();
                case 'schedule': return renderScheduleTab();
                case 'reports': return renderReportsTab();
                default: return renderDashboardTab();
              }
            })()}
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="modal-overlay">
          <div className="modal-content course-modal">
            <div className="modal-header">
              <h3>📚 Create New Course</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowCreateCourseModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="course-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Computer Science 101"
                    value={newCourse.courseName}
                    onChange={(e) => setNewCourse(prev => ({...prev, courseName: e.target.value}))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    placeholder="e.g., CS101"
                    value={newCourse.courseCode}
                    onChange={(e) => setNewCourse(prev => ({...prev, courseCode: e.target.value.toUpperCase()}))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Course description..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse(prev => ({...prev, description: e.target.value}))}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department *</label>
                  <input
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={newCourse.department}
                    onChange={(e) => setNewCourse(prev => ({...prev, department: e.target.value}))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Credits</label>
                  <input
                    type="number"
                    placeholder="3"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse(prev => ({...prev, credits: e.target.value}))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Semester</label>
                  <select
                    value={newCourse.semester}
                    onChange={(e) => setNewCourse(prev => ({...prev, semester: e.target.value}))}
                  >
                    <option value="">Select Semester</option>
                    <option value="Fall 2025">Fall 2025</option>
                    <option value="Spring 2025">Spring 2025</option>
                    <option value="Summer 2025">Summer 2025</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Max Students</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={newCourse.maxStudents}
                    onChange={(e) => setNewCourse(prev => ({...prev, maxStudents: e.target.value}))}
                  />
                </div>
              </div>

              <div className="schedule-section">
                <h4>Schedule (Optional)</h4>
                <div className="days-selection">
                  <label>Days:</label>
                  <div className="days-grid">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} className="day-checkbox">
                        <input
                          type="checkbox"
                          checked={newCourse.schedule.days.includes(day)}
                          onChange={() => handleDayToggle(day)}
                        />
                        {day.slice(0, 3)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={newCourse.schedule.startTime}
                      onChange={(e) => setNewCourse(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, startTime: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={newCourse.schedule.endTime}
                      onChange={(e) => setNewCourse(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, endTime: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Classroom</label>
                  <input
                    type="text"
                    placeholder="e.g., Room 101, Lab A"
                    value={newCourse.schedule.classroom}
                    onChange={(e) => setNewCourse(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, classroom: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="action-btn primary"
                  onClick={handleCreateCourse}
                >
                  ✅ Create Course
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={() => setShowCreateCourseModal(false)}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {isSessionDisplay && (
        <div className="modal-overlay">
          <SessionDetails
            currentSession={currentSession}
            toggleSessionDetails={toggleSessionDetails}
          />
        </div>
      )}

      {/* New Session Modal */}
      {isOpen && (
        <div className="modal-overlay">
          <NewSession togglePopup={togglePopup} />
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add {newEvent.type === 'class' ? 'Class' : newEvent.type === 'task' ? 'Task' : 'Reminder'}</h3>
              <button onClick={() => setShowEventModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleAddEvent} className="modal-form">
              <div className="form-group">
                <label>Event Type</label>
                <select 
                  value={newEvent.type} 
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  required
                >
                  <option value="class">Class</option>
                  <option value="task">Task</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={newEvent.title} 
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder={`Enter ${newEvent.type} title`}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={newEvent.date} 
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  required
                />
              </div>

              {newEvent.type === 'class' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time</label>
                      <input 
                        type="time" 
                        value={newEvent.startTime} 
                        onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time</label>
                      <input 
                        type="time" 
                        value={newEvent.endTime} 
                        onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Subject</label>
                      <input 
                        type="text" 
                        value={newEvent.subject} 
                        onChange={(e) => setNewEvent({...newEvent, subject: e.target.value})}
                        placeholder="Enter subject name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Classroom</label>
                      <input 
                        type="text" 
                        value={newEvent.classroom} 
                        onChange={(e) => setNewEvent({...newEvent, classroom: e.target.value})}
                        placeholder="Enter classroom/location"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {(newEvent.type === 'task' || newEvent.type === 'reminder') && (
                <>
                  <div className="form-group">
                    <label>Time</label>
                    <input 
                      type="time" 
                      value={newEvent.startTime} 
                      onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      value={newEvent.description} 
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      placeholder={`Enter ${newEvent.type} details`}
                      rows="3"
                    />
                  </div>
                  
                  {newEvent.type === 'task' && (
                    <div className="form-group">
                      <label>Priority</label>
                      <select 
                        value={newEvent.priority} 
                        onChange={(e) => setNewEvent({...newEvent, priority: e.target.value})}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => setShowEventModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add {newEvent.type === 'class' ? 'Class' : newEvent.type === 'task' ? 'Task' : 'Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
