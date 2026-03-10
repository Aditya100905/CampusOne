import { Router } from "express";
import {
  generateSessions,
  getFacultySessions,
  getBatchSessions,
  getStudentSessions,
  getInstitutionSessions,
  cancelSession,
  holidaySession,
  deleteSession,
  generateFacultySessionsManual
} from "../controllers/attendenceSession.controller.js";
import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";

const router = Router();

// PUBLIC ROUTES
router.get("/faculty/:facultyId", getFacultySessions);
router.get("/student/:studentId", getStudentSessions);
router.get("/batch", getBatchSessions);
router.get("/institution/:institutionId", getInstitutionSessions);

// PROTECTED ROUTES
router.post("/generate", validateInstitutionJWT, generateSessions);
router.patch("/:sessionId/cancel", validateUserJWT, cancelSession);
router.patch("/:sessionId/holiday", validateUserJWT, holidaySession);
router.delete("/:sessionId", validateUserJWT, deleteSession);
router.post("/manual/faculty/:facultyId", validateUserJWT, generateFacultySessionsManual);

export default router;
