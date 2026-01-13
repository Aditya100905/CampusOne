import { Router } from "express";
import {
    createFaculty,
    registerFaculty,
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
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";

const router = Router();

// Public Routes
router.get("/:facultyId", getFacultyById);

// Protected Routes
router.post("/create-faculty", validateInstitutionJWT, createFaculty);
router.post("/register", validateInstitutionJWT, registerFaculty);
router.put("/edit-faculty/:facultyId", validateInstitutionJWT, editFaculty);
router.put("edit-facultyById/:facultyId", validateUserJWT, editFaculty);
router.get("/institution/:institutionId", validateInstitutionJWT, getFacultiesByInstitution);
router.get("/department/:departmentId", validateInstitutionJWT, getFacultiesByDepartment);
router.delete("/delete-faculty/:facultyId", validateInstitutionJWT, deleteFaculty);
router.put("/update-department/:facultyId", validateInstitutionJWT, updateFacultyDepartment);
router.put("/update-courses/:facultyId", validateInstitutionJWT, updateFacultyCourses);
router.put("/update-coursesById/:facultyId", validateUserJWT, updateFacultyCourses);
router.put("/toggle-in-charge/:facultyId", validateInstitutionJWT, toggleFacultyInCharge);

export default router;
