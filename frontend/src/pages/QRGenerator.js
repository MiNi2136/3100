import React, { useState } from "react";
import api from "../api";
import QRCode from "qrcode.react";
import "../styles/QRGenerator.css";

// Simple emoji replacements for icons
const FaQrcode = () => <span>📱</span>;
const FaCopy = () => <span>📋</span>; 
const FaDownload = () => <span>⬇️</span>;
const FaPlus = () => <span>➕</span>;

const QRGenerator = ({ teacherData }) => {
  const [sessionData, setSessionData] = useState({
    course: "",
    section: "",
    date: "",
    time: "",
    duration: "60",
    location: "",
    radius: "50",
  });
  const [qrData, setQrData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [recentSessions, setRecentSessions] = useState([]);

  // Handle form input changes
  const handleInputChange = (e) => {
    setSessionData({
      ...sessionData,
      [e.target.name]: e.target.value,
    });
  };

  // Generate QR code for session
  const generateQR = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate a random session ID
      const session_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      // Form data for API request
      const formData = {
        session_id,
        date: sessionData.date,
        time: sessionData.time,
        name: sessionData.course,
        duration: sessionData.duration,
        location: sessionData.location,
        radius: sessionData.radius,
        section: sessionData.section,
        token: localStorage.getItem("token"),
      };

      // Call API to create a session
      const response = await api.post("/sessions/create", formData);
      
      // Set QR code data and update state
      setQrData(response.data.url || `http://localhost:3000/student-form?session_id=${session_id}&email=${teacherData.email}`);
      setSessionCreated(true);
      
      // Add to recent sessions
      setRecentSessions([
        {
          id: session_id,
          course: sessionData.course,
          section: sessionData.section,
          date: sessionData.date,
          time: sessionData.time,
          qrUrl: response.data.url,
        },
        ...recentSessions.slice(0, 4), // Keep only the 5 most recent sessions
      ]);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy QR code URL to clipboard
  const copyQrUrl = () => {
    navigator.clipboard.writeText(qrData)
      .then(() => {
        alert("QR URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  // Download QR code as image
  const downloadQrCode = () => {
    const canvas = document.getElementById("qrcode-canvas");
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${sessionData.course}-${sessionData.date}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Reset form to create a new session
  const createNewSession = () => {
    setSessionCreated(false);
    setQrData("");
  };

  return (
    <div className="qr-generator">
      <div className="section-header">
        <h1>Generate Session QR Code</h1>
      </div>
      
      <div className="qr-content">
        <div className="qr-form-container">
          {!sessionCreated ? (
            <form className="qr-form" onSubmit={generateQR}>
              <h2>Session Details</h2>
              
              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  name="course"
                  value={sessionData.course}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Science 101"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Section</label>
                <input
                  type="text"
                  name="section"
                  value={sessionData.section}
                  onChange={handleInputChange}
                  placeholder="e.g., A"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={sessionData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={sessionData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={sessionData.duration}
                  onChange={handleInputChange}
                  min="15"
                  max="180"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={sessionData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Room 205"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Attendance Radius (meters)</label>
                <input
                  type="number"
                  name="radius"
                  value={sessionData.radius}
                  onChange={handleInputChange}
                  min="10"
                  max="200"
                  required
                />
              </div>
              
              <button 
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate QR Code"}
              </button>
            </form>
          ) : (
            <div className="qr-result">
              <h2>QR Code Generated</h2>
              
              <div className="session-details">
                <div className="detail-item">
                  <span className="label">Course:</span>
                  <span className="value">{sessionData.course}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Section:</span>
                  <span className="value">{sessionData.section}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Date:</span>
                  <span className="value">{new Date(sessionData.date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Time:</span>
                  <span className="value">{sessionData.time}</span>
                </div>
              </div>
              
              <div className="qr-actions">
                <button className="btn btn-secondary" onClick={copyQrUrl}>
                  <FaCopy /> Copy URL
                </button>
                <button className="btn btn-secondary" onClick={downloadQrCode}>
                  <FaDownload /> Download
                </button>
                <button className="btn btn-primary" onClick={createNewSession}>
                  <FaPlus /> New Session
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="qr-display">
          {qrData ? (
            <div className="qr-code-container">
              <div className="qr-code">
                <QRCode
                  id="qrcode-canvas"
                  value={qrData}
                  size={250}
                  level="H"
                />
              </div>
              <p className="qr-instructions">
                Have students scan this QR code to mark attendance
              </p>
            </div>
          ) : (
            <div className="qr-placeholder">
              <div className="placeholder-icon">
                <FaQrcode />
              </div>
              <p>Fill out the form to generate a QR code</p>
            </div>
          )}
        </div>
      </div>

      <div className="recent-sessions">
        <div className="section-header">
          <h2>Recent Sessions</h2>
        </div>
        
        {recentSessions.length > 0 ? (
          <div className="sessions-list">
            {recentSessions.map((session, index) => (
              <div key={index} className="session-card">
                <div className="session-info">
                  <h3>{session.course}</h3>
                  <p>Section {session.section}</p>
                  <p>
                    {new Date(session.date).toLocaleDateString()} • {session.time}
                  </p>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setQrData(session.qrUrl);
                    setSessionCreated(true);
                    setSessionData({
                      ...sessionData,
                      course: session.course,
                      section: session.section,
                      date: session.date,
                      time: session.time,
                    });
                  }}
                >
                  Show QR
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-sessions">
            <p>No recent sessions. Create a new session to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;
