import React, { useState, useEffect } from "react";
import { 
  FaPlus, 
  FaClock, 
  FaUserCheck, 
  FaUserTimes, 
  FaUsers, 
  FaGraduationCap, 
  FaCalendarAlt, 
  FaBell, 
  FaClipboardList 
} from "react-icons/fa";
import api from "../api";
import "../styles/NewTeacherDashboard.css";

const NewTeacherDashboard = ({ teacherData }) => {
  const [todaysAttendance, setTodaysAttendance] = useState({
    present: 0,
    absent: 0,
    permanentAbsent: 0,
    total: 0
  });
  
  const [classSchedule, setClassSchedule] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [filters, setFilters] = useState({
    course: 'all',
    section: 'all',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAttendanceData();
    fetchClassSchedule();
    fetchRecentActivities();
  }, [filters]);

  const fetchAttendanceData = async () => {
    try {
      const response = await api.get('/api/attendance/summary', {
        params: filters
      });
      setTodaysAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // Set dummy data for demo
      setTodaysAttendance({
        present: 45,
        absent: 8,
        permanentAbsent: 2,
        total: 55
      });
    }
  };

  const [todaysClasses, setTodaysClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newClass, setNewClass] = useState({
    course: "",
    section: "",
    time: "",
    duration: "60",
    room: ""
  });

  useEffect(() => {
    fetchDashboardData();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse || selectedSection || selectedDate) {
      fetchFilteredAttendance();
    }
  }, [selectedCourse, selectedSection, selectedDate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch today's attendance summary
      const attendanceResponse = await api.post("/teachers/todays-attendance", { token });
      setTodaysAttendance(attendanceResponse.data.attendance || mockTodaysAttendance);
      
      // Fetch today's classes
      const classesResponse = await api.post("/teachers/todays-classes", { token });
      setTodaysClasses(classesResponse.data.classes || mockTodaysClasses);
      
      // Fetch upcoming classes
      const upcomingResponse = await api.post("/teachers/upcoming-classes", { token });
      setUpcomingClasses(upcomingResponse.data.classes || mockUpcomingClasses);
      
      // Fetch recent activity
      const activityResponse = await api.post("/teachers/recent-activity", { token });
      setRecentActivity(activityResponse.data.activity || mockRecentActivity);
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      // Use mock data as fallback
      setTodaysAttendance(mockTodaysAttendance);
      setTodaysClasses(mockTodaysClasses);
      setUpcomingClasses(mockUpcomingClasses);
      setRecentActivity(mockRecentActivity);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/teachers/courses", { token });
      setCourses(response.data.courses || mockCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses(mockCourses);
    }
  };

  const fetchFilteredAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/teachers/filtered-attendance", {
        token,
        courseId: selectedCourse,
        sectionId: selectedSection,
        date: selectedDate
      });
      setTodaysAttendance(response.data.attendance || mockTodaysAttendance);
    } catch (err) {
      console.error("Error fetching filtered attendance:", err);
    }
  };

  const handleAddClass = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/teachers/add-class", {
        token,
        ...newClass,
        date: selectedDate
      });
      
      // Refresh classes
      fetchDashboardData();
      setShowAddClassModal(false);
      setNewClass({
        course: "",
        section: "",
        time: "",
        duration: "60",
        room: ""
      });
      
      alert("Class added successfully!");
    } catch (err) {
      console.error("Error adding class:", err);
      alert("Failed to add class. Please try again.");
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getClassStatus = (classTime) => {
    const now = new Date();
    const [hours, minutes] = classTime.split(':');
    const classDate = new Date();
    classDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const timeDiff = classDate - now;
    
    if (timeDiff < -3600000) { // 1 hour ago
      return 'completed';
    } else if (timeDiff < 0) {
      return 'ongoing';
    } else if (timeDiff < 1800000) { // 30 minutes
      return 'upcoming';
    } else {
      return 'scheduled';
    }
  };

  // Mock data
  const mockTodaysAttendance = {
    present: 85,
    absent: 12,
    permanentAbsent: 3,
    total: 100
  };

  const mockTodaysClasses = [
    {
      id: 1,
      course: "Computer Science 101",
      section: "A",
      time: "09:00",
      duration: 60,
      room: "CS-201",
      studentsCount: 30
    },
    {
      id: 2,
      course: "Data Structures",
      section: "B",
      time: "11:00",
      duration: 90,
      room: "CS-301",
      studentsCount: 25
    },
    {
      id: 3,
      course: "Algorithm Design",
      section: "A",
      time: "14:00",
      duration: 60,
      room: "CS-202",
      studentsCount: 28
    }
  ];

  const mockUpcomingClasses = [
    {
      id: 4,
      course: "Database Systems",
      section: "C",
      time: "16:00",
      duration: 90,
      room: "CS-401",
      studentsCount: 22
    }
  ];

  const mockRecentActivity = [
    {
      id: 1,
      type: "attendance",
      message: "Attendance marked for CS101 Section A",
      time: "2 hours ago",
      icon: "FaUserCheck"
    },
    {
      id: 2,
      type: "project",
      message: "New project assigned to Data Structures students",
      time: "4 hours ago",
      icon: "FaClipboardList"
    },
    {
      id: 3,
      type: "grade",
      message: "CT marks updated for Algorithm Design",
      time: "1 day ago",
      icon: "FaGraduationCap"
    }
  ];

  const mockCourses = [
    { id: "CS101", name: "Computer Science 101" },
    { id: "CS201", name: "Data Structures" },
    { id: "CS301", name: "Algorithm Design" },
    { id: "DB401", name: "Database Systems" }
  ];

  return (
    <div className="teacher-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {teacherData.name || 'Professor'}!</h1>
          <p>Here's what's happening in your classes today</p>
        </div>
        
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={() => setShowAddClassModal(true)}>
            <FaPlus /> Add Class
          </button>
          <div className="current-time">
            <FaClock />
            <span>{getCurrentTime()}</span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="dashboard-filters">
        <div className="filter-group">
          <label>Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Attendance Summary Cards */}
      <div className="attendance-summary">
        <div className="summary-card present">
          <div className="card-icon">
            <FaUserCheck />
          </div>
          <div className="card-content">
            <h3>Present</h3>
            <div className="card-number">{todaysAttendance.present}</div>
            <div className="card-percentage">
              {todaysAttendance.total > 0 ? 
                Math.round((todaysAttendance.present / todaysAttendance.total) * 100) : 0}%
            </div>
          </div>
        </div>
        
        <div className="summary-card absent">
          <div className="card-icon">
            <FaUserTimes />
          </div>
          <div className="card-content">
            <h3>Absent</h3>
            <div className="card-number">{todaysAttendance.absent}</div>
            <div className="card-percentage">
              {todaysAttendance.total > 0 ? 
                Math.round((todaysAttendance.absent / todaysAttendance.total) * 100) : 0}%
            </div>
          </div>
        </div>
        
        <div className="summary-card permanent-absent">
          <div className="card-icon">
            <FaUsers />
          </div>
          <div className="card-content">
            <h3>Permanent Absent</h3>
            <div className="card-number">{todaysAttendance.permanentAbsent}</div>
            <div className="card-percentage">
              {todaysAttendance.total > 0 ? 
                Math.round((todaysAttendance.permanentAbsent / todaysAttendance.total) * 100) : 0}%
            </div>
          </div>
        </div>
        
        <div className="summary-card total">
          <div className="card-icon">
            <FaGraduationCap />
          </div>
          <div className="card-content">
            <h3>Total Students</h3>
            <div className="card-number">{todaysAttendance.total}</div>
            <div className="card-subtitle">Enrolled</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Today's Classes */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2><FaCalendarAlt /> Today's Classes</h2>
            <span className="section-count">{todaysClasses.length} classes</span>
          </div>
          
          <div className="classes-list">
            {todaysClasses.map((classItem) => (
              <div key={classItem.id} className={`class-card ${getClassStatus(classItem.time)}`}>
                <div className="class-time">
                  <FaClock />
                  <span>{classItem.time}</span>
                  <small>{classItem.duration} min</small>
                </div>
                
                <div className="class-details">
                  <h4>{classItem.course}</h4>
                  <p>Section {classItem.section} • Room {classItem.room}</p>
                  <div className="students-count">
                    <FaUsers />
                    <span>{classItem.studentsCount} students</span>
                  </div>
                </div>
                
                <div className={`class-status ${getClassStatus(classItem.time)}`}>
                  {getClassStatus(classItem.time).toUpperCase()}
                </div>
              </div>
            ))}
            
            {upcomingClasses.map((classItem) => (
              <div key={classItem.id} className={`class-card ${getClassStatus(classItem.time)}`}>
                <div className="class-time">
                  <FaClock />
                  <span>{classItem.time}</span>
                  <small>{classItem.duration} min</small>
                </div>
                
                <div className="class-details">
                  <h4>{classItem.course}</h4>
                  <p>Section {classItem.section} • Room {classItem.room}</p>
                  <div className="students-count">
                    <FaUsers />
                    <span>{classItem.studentsCount} students</span>
                  </div>
                </div>
                
                <div className={`class-status ${getClassStatus(classItem.time)}`}>
                  {getClassStatus(classItem.time).toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2><FaBell /> Recent Activity</h2>
          </div>
          
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.icon === 'FaUserCheck' && <FaUserCheck />}
                  {activity.icon === 'FaClipboardList' && <FaClipboardList />}
                  {activity.icon === 'FaGraduationCap' && <FaGraduationCap />}
                </div>
                <div className="activity-content">
                  <p>{activity.message}</p>
                  <small>{activity.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Class</h2>
              <button
                className="close-modal"
                onClick={() => setShowAddClassModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Course</label>
                <select
                  value={newClass.course}
                  onChange={(e) => setNewClass({...newClass, course: e.target.value})}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Section</label>
                <select
                  value={newClass.section}
                  onChange={(e) => setNewClass({...newClass, section: e.target.value})}
                  required
                >
                  <option value="">Select Section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={newClass.time}
                  onChange={(e) => setNewClass({...newClass, time: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={newClass.duration}
                  onChange={(e) => setNewClass({...newClass, duration: e.target.value})}
                  min="30"
                  max="180"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Room</label>
                <input
                  type="text"
                  value={newClass.room}
                  onChange={(e) => setNewClass({...newClass, room: e.target.value})}
                  placeholder="e.g., CS-201"
                  required
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddClassModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddClass}
                disabled={!newClass.course || !newClass.section || !newClass.time || !newClass.room}
              >
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewTeacherDashboard;
