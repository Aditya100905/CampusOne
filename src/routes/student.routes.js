import { Router } from "express";
import {
    createStudent,
    deleteStudent,
    editStudent,
    getStudentsByBranch,
    getStudentsByInstitution,
    getStudentById,
    updateStudentBranch,
    updateHostelStatus,
    updateStudentSemester,
    modifyActiveStatus,
    addCourses,
    deleteCourses,
    deleteStudentPrevCourses,
    finishCoursesById
} from "../controllers/student.controller.js";

import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";

const router = Router();

// GET ROUTES
router.get("/institution/:institutionId", validateInstitutionJWT, getStudentsByInstitution);
router.get("/branch/:branchId", validateInstitutionJWT, getStudentsByBranch);

// PUBLIC LAST
router.get("/:studentId", getStudentById);

// POST ROUTES
router.post("/create-student", validateInstitutionJWT, createStudent);

// PUT ROUTES
router.put("/edit-student/:studentId", validateInstitutionJWT, editStudent);
router.put("/update-branch/:studentId", validateInstitutionJWT, updateStudentBranch);
router.put("/add-courses/:studentId", validateInstitutionJWT, addCourses);
router.put("/delete-courses/:studentId", validateInstitutionJWT, deleteCourses);
router.put("/delete-prev-courses/:studentId", validateInstitutionJWT, deleteStudentPrevCourses);
router.put("/update-hostel-status/:studentId", validateInstitutionJWT, updateHostelStatus);
router.put("/change-status/:studentId", validateInstitutionJWT, modifyActiveStatus);
router.put("/finish-courses/:studentId", validateInstitutionJWT, finishCoursesById);
router.put("/update-semester/:studentId", validateUserJWT, updateStudentSemester);
router.put("/student/edit/:studentId", validateUserJWT, editStudent);
router.put("/student/update-hostel/:studentId", validateUserJWT, updateHostelStatus);

// DELETE ROUTES
router.delete("/delete-student/:studentId", validateInstitutionJWT, deleteStudent);

export default router;