import { Router } from "express";
const router = Router();
import upload from "../middleware/multer.js";
import SessionController from "../controllers/SessionController.js";
import JWT from "../middleware/JWT.js";

//login
router.post("/create", JWT.verifyToken, SessionController.CreateNewSession);
//get sessions
router.post(
  "/getSessions",
  JWT.verifyToken,
  SessionController.GetAllTeacherSessions
);
//get QR
router.post("/getQR", JWT.verifyToken, SessionController.GetQR);
//attend session
router.post(
  "/attend_session",
  JWT.verifyToken,
  upload.single("image"),
  SessionController.AttendSession
);
//get student sessions
router.post(
  "/getStudentSessions",
  JWT.verifyToken,
  SessionController.GetStudentSessions
);

// Get active sessions for students (no auth required for demo)
router.get("/active-sessions", SessionController.GetActiveSessionsForStudents);

// Submit attendance via QR scan
router.post("/submit-attendance", SessionController.SubmitAttendance);

// Get student attendance records
router.get("/student-attendance", SessionController.GetStudentAttendance);

export default router;
