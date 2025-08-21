import dotenv from "dotenv";
dotenv.config();
import querystring from "querystring";
import { Teacher } from "../model/Teacher.js";
import { Student } from "../model/Student.js";
import uploadImage from "../middleware/Cloudinary.js";
import { addActiveSession, getActiveSessions, getSessionById, removeActiveSession } from "../utils/activeSessionsStore.js";

function getQR(session_id, email) {
  let url = `${process.env.CLIENT_URL || "http://localhost:3000"}/login?${querystring.stringify({
    session_id,
    email,
  })}`;
  return url;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in meters
  return distance;
}
function checkStudentDistance(Location1, Location2) {
  Location1 = Location1.split(",");
  Location2 = Location2.split(",");
  const locationLat1 = parseFloat(Location1[0]);
  const locationLon1 = parseFloat(Location1[1]);
  const locationLat2 = parseFloat(Location2[0]);
  const locationLon2 = parseFloat(Location2[1]);

  const distance = haversineDistance(
    locationLat1,
    locationLon1,
    locationLat2,
    locationLon2
  );
  return distance.toFixed(2);
}

//make controller functions

async function CreateNewSession(req, res) {
  try {
    let { session_id, name, duration, location, radius, date, time, course, section } =
      req.body;
    let tokenData = req.user;

    // Validate required fields
    if (!session_id || !name || !date || !time) {
      return res.status(400).json({ 
        message: "Missing required fields: session_id, name, date, time" 
      });
    }

    let newSession = {
      session_id,
      date,
      time,
      name,
      course: course || '',
      section: section || '',
      duration: duration || 60,
      location: location || '',
      radius: radius || 100,
    };

    // Handle demo user case
    if (tokenData.email === 'demo@teacher.com') {
      // Add to active sessions store for demo
      const activeSession = addActiveSession({
        ...newSession,
        subject: name,
        instructor: 'Demo Teacher'
      });
      
      return res.status(200).json({
        success: true,
        url: getQR(session_id, tokenData.email),
        message: "Demo session created successfully",
        session: activeSession
      });
    }

    let teacher = await Teacher.findOneAndUpdate(
      { email: tokenData.email },
      { $push: { sessions: newSession } },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Add to active sessions store
    const activeSession = addActiveSession({
      ...newSession,
      subject: name,
      instructor: teacher.name || 'Teacher'
    });

    res.status(200).json({
      success: true,
      url: getQR(session_id, teacher.email),
      message: "Session created successfully",
      session: activeSession
    });
  } catch (err) {
    console.error("CreateNewSession error:", err);
    res.status(400).json({ message: err.message });
  }
}
//get sessions
async function GetAllTeacherSessions(req, res) {
  try {
    let tokenData = req.user;
    const teacher = await Teacher.findOne({ email: tokenData.email });
    res.status(200).json({ sessions: teacher.sessions });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
//get QR
async function GetQR(req, res) {
  try {
    let tokenData = req.user;
    let url = getQR(req.body.session_id, tokenData.email);
    res.status(200).json({ url });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

//attend session
async function AttendSession(req, res) {
  let tokenData = req.user;
  let { session_id, teacher_email, regno, IP, student_email, Location, date } =
    req.body;
  let imageName = req.file.filename;

  try {
    let present = false;
    const teacher = await Teacher.findOne({ email: teacher_email });
    let session_details = {};
    teacher.sessions.map(async (session) => {
      if (session.session_id === session_id) {
        let distance = checkStudentDistance(Location, session.location);
        session.attendance.map((student) => {
          if (
            student.regno === regno ||
            student.student_email === student_email
          ) {
            present = true;
          }
        });
        if (!present) {
          res.status(200).json({ message: "Attendance marked successfully" });
          await uploadImage(imageName).then((result) => {
            session_details = {
              session_id: session.session_id,
              teacher_email: teacher.email,
              name: session.name,
              date: session.date,
              time: session.time,
              duration: session.duration,
              distance: distance,
              radius: session.radius,
              image: result,
            };
            session.attendance.push({
              regno,
              image: result,
              date,
              IP,
              student_email: tokenData.email,
              Location,
              distance,
            });
          });
          await Teacher.findOneAndUpdate(
            { email: teacher_email },
            { sessions: teacher.sessions }
          );
          await Student.findOneAndUpdate(
            { email: student_email },
            { $push: { sessions: session_details } }
          );
        }
      }
    });
    if (present) {
      res.status(200).json({ message: "Attendance already marked" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

//get student sessions
async function GetStudentSessions(req, res) {
  let tokenData = req.user;
  try {
    const student = await Student.findOne({
      email: tokenData.email,
    });
    res.status(200).json({ sessions: student.sessions });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// Get active sessions for students
const GetActiveSessionsForStudents = async (req, res) => {
  try {
    const sessions = getActiveSessions();
    res.status(200).json({
      success: true,
      sessions: sessions
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active sessions'
    });
  }
};

// Submit attendance via QR scan
const SubmitAttendance = async (req, res) => {
  try {
    const { sessionId, qrData } = req.body;
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    // Extract token data (simplified for demo)
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // For demo purposes, simulate successful attendance
    if (qrData === 'demo-qr-data' || qrData.includes('mock')) {
      return res.status(200).json({
        success: true,
        message: 'Demo attendance marked successfully',
        attendance: {
          sessionId,
          studentName: 'Demo Student',
          timestamp: new Date().toISOString(),
          status: 'Present'
        }
      });
    }

    // Verify session exists in active sessions
    const session = getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or expired'
      });
    }

    // Mark attendance (simplified for demo)
    const attendanceRecord = {
      session_id: sessionId,
      subject: session.subject,
      date: session.date,
      time: session.time,
      status: 'Present',
      marked_at: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: attendanceRecord
    });

  } catch (error) {
    console.error('Error submitting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit attendance'
    });
  }
};

// Get student attendance records
const GetStudentAttendance = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { course } = req.query;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    // Demo attendance data
    const demoAttendance = [
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

    let filteredAttendance = demoAttendance;
    if (course && course !== 'all') {
      filteredAttendance = demoAttendance.filter(a => 
        a.subject.toLowerCase().includes(course.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      attendance: filteredAttendance
    });

  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance'
    });
  }
};

const SessionController = {
  CreateNewSession,
  GetAllTeacherSessions,
  GetQR,
  AttendSession,
  GetStudentSessions,
  GetActiveSessionsForStudents,
  SubmitAttendance,
  GetStudentAttendance,
};

export default SessionController;
