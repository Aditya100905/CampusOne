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

// GET ROUTES
router.get("/faculty/:facultyId", getFacultyTimetable);
router.get("/student/:studentId", getStudentTimetable);
router.get("/institution/:institutionId", getInstitutionTimetable);

// POST ROUTES
router.post("/slot", validateInstitutionJWT, createSlot);

// PATCH ROUTES
router.patch("/slot/:slotId", validateInstitutionJWT, updateSlot);

// DELETE ROUTES
router.delete("/institution/:institutionId/clear", validateInstitutionJWT, clearInstitutionTimetable);
router.delete("/slot/:slotId", validateInstitutionJWT, deleteSlot);

export default router;
