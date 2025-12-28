import { Router } from "express";
import {
    createFaculty,
    deleteFaculty,
    editFaculty,
    getFacultiesByDepartment,
    getFacultiesByInstitution,
    getFacultyById,
    toggleFacultyInCharge,
    updateFacultyCourses,
    updateFacultyDepartment
} from "../controllers/faculty.controller.js";

import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";

const router = Router();

// Public Routes
router.get("/:facultyId", getFacultyById);

// Protected Routes
router.post("/create-faculty", validateInstitutionJWT, createFaculty);
router.put("/edit-faculty/:facultyId", validateInstitutionJWT, editFaculty);
router.get("/institution/:institutionId", validateInstitutionJWT, getFacultiesByInstitution);
router.get("/department/:departmentId", validateInstitutionJWT, getFacultiesByDepartment);
router.delete("/delete-faculty/:facultyId", validateInstitutionJWT, deleteFaculty);
router.put("/update-department/:facultyId", validateInstitutionJWT, updateFacultyDepartment);
router.put("/update-courses/:facultyId", validateInstitutionJWT, updateFacultyCourses);
router.put("/toggle-in-charge/:facultyId", validateInstitutionJWT, toggleFacultyInCharge);

export default router;
