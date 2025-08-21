import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/TeacherProfile.css";

// Import components for different sections
import TeacherDashboard from "./TeacherDashboard";
import QRGenerator from "./QRGenerator";
import AttendanceManagement from "./AttendanceManagement";
import ProjectManagement from "./ProjectManagement";
import Reports from "./Reports";
import TeacherSettings from "./TeacherSettings";

// Icon replacements (using emojis instead of react-icons)
const icons = {
  FaHome: '🏠',
  FaQrcode: '📱', 
  FaUserCheck: '✓',
  FaProjectDiagram: '📊',
  FaChartBar: '📈',
  FaCog: '⚙️',
  FaUser: '👤',
  FaSignOutAlt: '🚪',
  FaSearch: '🔍',
  FaCalendarAlt: '📅',
  FaBook: '📚',
  FaClock: '🕐'
};

const TeacherProfile = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [teacherData, setTeacherData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch teacher profile data
    const fetchTeacherData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.post("/users/profile", { token });
        setTeacherData(response.data.user);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching teacher data:", err);
        setIsLoading(false);
      }
    };
    
    fetchTeacherData();
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("type");
    navigate("/login");
  };
  
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <TeacherDashboard teacherData={teacherData} />;
      case "qr":
        return <QRGenerator teacherData={teacherData} />;
      case "attendance":
        return <AttendanceManagement teacherData={teacherData} />;
      case "projects":
        return <ProjectManagement teacherData={teacherData} />;
      case "reports":
        return <Reports teacherData={teacherData} />;
      case "settings":
        return <TeacherSettings teacherData={teacherData} />;
      default:
        return <TeacherDashboard teacherData={teacherData} />;
    }
  };
  
  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }
  
  return (
    <div className="teacher-profile-container">
      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="logo">
          <h2>Atendo</h2>
        </div>
        
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search courses, students, or sessions..." />
        </div>
        
        <div className="profile-section">
          <div 
            className="profile-dropdown"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="profile-image">
              {teacherData.name ? teacherData.name.charAt(0).toUpperCase() : "T"}
            </div>
            <span className="profile-name">{teacherData.name}</span>
            
            {showProfileDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => setActiveTab("settings")}>
                  <span>👤</span> Profile
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <span>🚪</span> Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <div className="main-content">
        {/* Side Navigation */}
        <div className="side-navbar">
          <div 
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span>🏠</span> <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${activeTab === "qr" ? "active" : ""}`}
            onClick={() => setActiveTab("qr")}
          >
            <span>📱</span> <span>Generate QR</span>
          </div>
          <div 
            className={`nav-item ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            <span>✓</span> <span>Attendance Management</span>
          </div>
          <div 
            className={`nav-item ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            <span>📊</span> <span>Project Management</span>
          </div>
          <div 
            className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <span>📈</span> <span>Reports</span>
          </div>
          <div 
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span>⚙️</span> <span>Settings</span>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="content-area">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
