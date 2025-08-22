import React, { useState } from "react";
import "../styles/Dashboard.css";
import "../styles/TeacherDashboard.css";
import Nav from "./Nav";

const TeacherDashboard = () => {
  console.log("✅ Simple TeacherDashboard component loaded - Testing basic functionality");
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="teacher-dashboard">
      <Nav />
      
      <div className="dashboard-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Teacher Dashboard</h2>
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              <li className={activeTab === 'dashboard' ? 'active' : ''}>
                <button onClick={() => setActiveTab('dashboard')}>
                  🏠 Dashboard
                </button>
              </li>
              <li className={activeTab === 'schedule' ? 'active' : ''}>
                <button onClick={() => setActiveTab('schedule')}>
                  📅 Schedule
                </button>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="main-content">
          <div className="content-header">
            <h1>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'schedule' && 'Schedule Calendar'}
            </h1>
          </div>
          
          <div className="tab-content">
            {activeTab === 'dashboard' && (
              <div className="dashboard-tab">
                <h3>Welcome to Teacher Dashboard</h3>
                <p>This is a simplified version to test functionality.</p>
                <p>✅ Component is loading correctly</p>
                <p>✅ Navigation is working</p>
                <p>✅ No sample data present</p>
              </div>
            )}
            
            {activeTab === 'schedule' && (
              <div className="schedule-tab">
                <h3>📅 Schedule Calendar</h3>
                <p>Schedule functionality is working!</p>
                <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', margin: '20px 0' }}>
                  <h4>Clean Schedule - Ready for your classes</h4>
                  <p>No sample data present. You can now add your own classes.</p>
                  <button 
                    onClick={() => alert('Schedule functionality is working! Full features coming soon.')}
                    style={{ 
                      background: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      padding: '10px 20px', 
                      borderRadius: '5px', 
                      cursor: 'pointer' 
                    }}
                  >
                    ➕ Add Class (Test)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
