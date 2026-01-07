import { Router } from "express";
import {
    createStudent,
    deleteStudent,
    editStudent,
    getStudentsByDepartment,
    getStudentsByInstitution,
    getStudentById,
    updateStudentCourses,
    updateStudentDepartment,
    updateHostelStatus
} from "../controllers/student.controller.js";

import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";

const router = Router();

// public routes
router.get("/:studentId", getStudentById);

// protected routes
router.post(
    "/create-student",
    validateInstitutionJWT,
    createStudent
);
router.put(
    "/edit-student/:studentId",
    validateInstitutionJWT,
    editStudent
);
router.get(
    "/institution/:institutionId",
    validateInstitutionJWT,
    getStudentsByInstitution
);
router.get(
    "/department/:departmentId",
    validateInstitutionJWT,
    getStudentsByDepartment
);
router.delete(
    "/delete-student/:studentId",
    validateInstitutionJWT,
    deleteStudent
);
router.put(
    "/update-department/:studentId",
    validateInstitutionJWT,
    updateStudentDepartment
);
router.put(
    "/update-courses/:studentId",
    validateInstitutionJWT,
    updateStudentCourses
);
router.put(
    "/update-hostel-status/:studentId",
    validateInstitutionJWT,
    updateHostelStatus
);
router.put(
    "/edit-studentById/:studentId",
    validateUserJWT,
    editStudent
);
router.put(
    "/update-coursesById/:studentId",
    validateUserJWT,
    updateStudentCourses
);
router.put(
    "/update-hostel-statusById/:studentId",
    validateUserJWT,
    updateHostelStatus
);

export default router;
