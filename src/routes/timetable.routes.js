import { Router } from "express";

import {
  createSlot,
  getFacultyTimetable,
  getStudentTimetable,
  getInstitutionTimetable,
  updateSlot,
  deleteSlot
} from "../controllers/timetable.controller.js";
import { clearInstitutionTimetable } from "../controllers/timetable.controller.js";
import { validateInstitutionJWT } from '../middlewares/institutionAuth.middleware.js';

const router = Router();

// PUBLIC ROUTES
router.get("/faculty/:facultyId", getFacultyTimetable);
router.get("/student/:studentId", getStudentTimetable);
router.get("/institution/:institutionId", getInstitutionTimetable);

// INSTITUTION-AUTH ROUTES
router.post("/slot", validateInstitutionJWT, createSlot);
router.patch("/slot/:slotId", validateInstitutionJWT, updateSlot);
router.delete("/slot/:slotId", validateInstitutionJWT, deleteSlot);
router.delete("/institution/:institutionId/clear", validateInstitutionJWT, clearInstitutionTimetable);

export default router;
