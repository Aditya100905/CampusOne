import { Router } from "express";

import {
    createFaculty,
    editFaculty,
    deleteFaculty,
    getFacultiesByInstitution,
    getFacultiesByDepartment,
    getFacultyById,
    updateFacultyDepartment,
    addFacultyCourse,
    deleteFacultyCourse,
    deleteFacultyPrevCourse,
    finishFacultyCourse,
    modifyActiveStatus,
    toggleFacultyInCharge
} from "../controllers/faculty.controller.js";

import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";

const router = Router();

// INSTITUTION-AUTH ROUTES
router.post("/", validateInstitutionJWT, createFaculty);
router.put("/:facultyId", validateInstitutionJWT, editFaculty);
router.delete("/:facultyId", validateInstitutionJWT, deleteFaculty);

router.get("/by-institution/:institutionId", validateInstitutionJWT, getFacultiesByInstitution);
router.get("/by-department/:departmentId", validateInstitutionJWT, getFacultiesByDepartment);

router.put("/:facultyId/department", validateInstitutionJWT, updateFacultyDepartment);
router.put("/:facultyId/status", validateInstitutionJWT, modifyActiveStatus);
router.put("/:facultyId/in-charge", validateInstitutionJWT, toggleFacultyInCharge);

router.put("/:facultyId/courses", validateInstitutionJWT, addFacultyCourse);
router.delete("/:facultyId/courses/:courseId", validateInstitutionJWT, deleteFacultyCourse);
router.delete("/:facultyId/prev-courses/:courseId", validateInstitutionJWT, deleteFacultyPrevCourse);
router.put("/:facultyId/courses/:courseId/finish", validateInstitutionJWT, finishFacultyCourse);

// USER-SELF ROUTES
router.put("/self/:facultyId", validateUserJWT, editFaculty);
router.put("/self/:facultyId/courses", validateUserJWT, addFacultyCourse);
router.delete("/self/:facultyId/courses/:courseId", validateUserJWT, deleteFacultyCourse);
router.delete("/self/:facultyId/prev-courses/:courseId", validateUserJWT, deleteFacultyPrevCourse);
router.put("/self/:facultyId/courses/:courseId/finish", validateUserJWT, finishFacultyCourse);

// PUBLIC ROUTES
router.get("/:facultyId", getFacultyById);

export default router;
