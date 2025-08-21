import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/TeacherSettings.css";

// Simple emoji replacements for icons
const FaUserCircle = () => <span>👤</span>;
const FaEdit = () => <span>✏️</span>;
const FaCheck = () => <span>✅</span>;
const FaTimes = () => <span>❌</span>;
const FaCamera = () => <span>📷</span>;
const FaKey = () => <span>🔑</span>;

const TeacherSettings = ({ teacherData }) => {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    bio: "",
    profilePicture: null,
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    sessionReminders: true,
    attendanceAlerts: true,
    projectDeadlines: true,
    systemUpdates: false,
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  
  useEffect(() => {
    // Set initial profile data from teacherData prop
    if (teacherData) {
      setProfileData({
        name: teacherData.name || "",
        email: teacherData.email || "",
        phone: teacherData.phone || "",
        department: teacherData.department || "",
        designation: teacherData.designation || "",
        bio: teacherData.bio || "",
        profilePicture: teacherData.profilePicture || null,
      });
    }
  }, [teacherData]);
  
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleNotificationChange = (e) => {
    setNotificationSettings({
      ...notificationSettings,
      [e.target.name]: e.target.checked,
    });
  };
  
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          profilePicture: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/users/update-profile", {
        token,
        ...profileData,
      });
      
      if (response.data.success) {
        setIsEditing(false);
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMessage("Failed to update profile. Please try again.");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("New passwords do not match!");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/users/change-password", {
        token,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      if (response.data.success) {
        setSuccessMessage("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setErrorMessage(err.response?.data?.message || "Failed to change password. Please try again.");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };
  
  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/users/update-notifications", {
        token,
        settings: notificationSettings,
      });
      
      if (response.data.success) {
        setSuccessMessage("Notification settings updated!");
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Error updating notification settings:", err);
      setErrorMessage("Failed to update notification settings. Please try again.");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };
  
  return (
    <div className="teacher-settings">
      <div className="section-header">
        <h1>Settings</h1>
      </div>
      
      <div className="settings-content">
        <div className="settings-sidebar">
          <div
            className={`settings-nav-item ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => setActiveSection("profile")}
          >
            Profile Information
          </div>
          <div
            className={`settings-nav-item ${activeSection === "password" ? "active" : ""}`}
            onClick={() => setActiveSection("password")}
          >
            Change Password
          </div>
          <div
            className={`settings-nav-item ${activeSection === "notifications" ? "active" : ""}`}
            onClick={() => setActiveSection("notifications")}
          >
            Notification Settings
          </div>
        </div>
        
        <div className="settings-main">
          {successMessage && (
            <div className="success-message">
              <FaCheck /> {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="error-message">
              <FaTimes /> {errorMessage}
            </div>
          )}
          
          {activeSection === "profile" && (
            <div className="profile-section">
              <div className="profile-header">
                <h2>Profile Information</h2>
                <button
                  className="edit-button"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : <><FaEdit /> Edit</>}
                </button>
              </div>
              
              <div className="profile-picture-container">
                {profileData.profilePicture ? (
                  <img
                    src={profileData.profilePicture}
                    alt="Profile"
                    className="profile-picture"
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    <FaUserCircle />
                  </div>
                )}
                
                {isEditing && (
                  <div className="profile-picture-edit">
                    <label htmlFor="profile-picture-upload">
                      <FaCamera />
                    </label>
                    <input
                      type="file"
                      id="profile-picture-upload"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      style={{ display: "none" }}
                    />
                  </div>
                )}
              </div>
              
              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={profileData.department}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={profileData.designation}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
                
                {isEditing && (
                  <div className="form-actions">
                    <button type="submit" className="save-button">
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
          
          {activeSection === "password" && (
            <div className="password-section">
              <h2>Change Password</h2>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input">
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <FaKey className="password-icon" />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input">
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <FaKey className="password-icon" />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="password-input">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <FaKey className="password-icon" />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {activeSection === "notifications" && (
            <div className="notifications-section">
              <h2>Notification Settings</h2>
              
              <form onSubmit={handleNotificationSubmit}>
                <div className="notification-toggle">
                  <div className="toggle-info">
                    <h3>Email Notifications</h3>
                    <p>Receive general updates and notifications via email</p>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      name="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                    />
                    <label htmlFor="emailNotifications"></label>
                  </div>
                </div>
                
                <div className="notification-toggle">
                  <div className="toggle-info">
                    <h3>Session Reminders</h3>
                    <p>Get notified before your scheduled sessions</p>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="sessionReminders"
                      name="sessionReminders"
                      checked={notificationSettings.sessionReminders}
                      onChange={handleNotificationChange}
                    />
                    <label htmlFor="sessionReminders"></label>
                  </div>
                </div>
                
                <div className="notification-toggle">
                  <div className="toggle-info">
                    <h3>Attendance Alerts</h3>
                    <p>Receive alerts for unusual attendance patterns</p>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="attendanceAlerts"
                      name="attendanceAlerts"
                      checked={notificationSettings.attendanceAlerts}
                      onChange={handleNotificationChange}
                    />
                    <label htmlFor="attendanceAlerts"></label>
                  </div>
                </div>
                
                <div className="notification-toggle">
                  <div className="toggle-info">
                    <h3>Project Deadlines</h3>
                    <p>Get reminders for upcoming project deadlines</p>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="projectDeadlines"
                      name="projectDeadlines"
                      checked={notificationSettings.projectDeadlines}
                      onChange={handleNotificationChange}
                    />
                    <label htmlFor="projectDeadlines"></label>
                  </div>
                </div>
                
                <div className="notification-toggle">
                  <div className="toggle-info">
                    <h3>System Updates</h3>
                    <p>Receive information about new features and updates</p>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="systemUpdates"
                      name="systemUpdates"
                      checked={notificationSettings.systemUpdates}
                      onChange={handleNotificationChange}
                    />
                    <label htmlFor="systemUpdates"></label>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherSettings;
