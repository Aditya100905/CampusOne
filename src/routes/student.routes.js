import { Router } from "express";
import {
    createStudent,
    editStudent,
    getStudentsByInstitution,
    getStudentsByBranch,
    getStudentById,
    deleteStudent,
    updateStudentBranch,
    addCourses,
    deleteCourses,
    deleteStudentPrevCourses,
    updateStudentSemester,
    updateHostelStatus,
    modifyActiveStatus,
    finishCoursesById,
    updateStudentsSemesterBulk,
    addCoursesByEnrollmentNumbers,
    finishCoursesByEnrollmentNumbers,
    addCoursesByBranchAndYearOfAdmission,
    updateStudentsSemesterByEnrollmentNumbers,
    bulkDeactivateStudentsByEnrollmentNumbers,
    bulkDeactivateStudentsByBranchAndYear,
} from "../controllers/student.controller.js";

import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";

const router = Router();

// GET ROUTES
router.get("/institution/:institutionId", validateInstitutionJWT, getStudentsByInstitution);
router.get("/institution-faculty/:institutionId", validateUserJWT, getStudentsByInstitution);
router.get("/branch/:branchId", validateInstitutionJWT, getStudentsByBranch);
router.get("/branch-faculty/:branchId", validateUserJWT, getStudentsByBranch);

// PUBLIC LAST
router.get("/:studentId", getStudentById);

// POST ROUTES
router.post("/create-student", validateInstitutionJWT, createStudent);

// PUT ROUTES
router.put("/updateSemesterByBatch", validateInstitutionJWT, updateStudentsSemesterBulk);
router.put("/addCourses", validateInstitutionJWT, addCoursesByEnrollmentNumbers);
router.put("/finishCourses", validateInstitutionJWT, finishCoursesByEnrollmentNumbers);
router.put("/addCoursesByBatch", validateInstitutionJWT, addCoursesByBranchAndYearOfAdmission);
router.put("/updateSemester", validateInstitutionJWT, updateStudentsSemesterByEnrollmentNumbers);
router.put("/bulkDeactivate", validateInstitutionJWT, bulkDeactivateStudentsByEnrollmentNumbers);
router.put("/deactivateBatch", validateInstitutionJWT, bulkDeactivateStudentsByBranchAndYear);
router.put("/edit-student/:studentId", validateInstitutionJWT, editStudent);
router.put("/edit/:studentId", validateUserJWT, editStudent);
router.put("/update-branch/:studentId", validateInstitutionJWT, updateStudentBranch);
router.put("/add-courses/:studentId", validateInstitutionJWT, addCourses);
router.put("/delete-courses/:studentId", validateInstitutionJWT, deleteCourses);
router.put("/delete-prev-courses/:studentId", validateInstitutionJWT, deleteStudentPrevCourses);
router.put("/update-hostel-status/:studentId", validateInstitutionJWT, updateHostelStatus);
router.put("/change-status/:studentId", validateInstitutionJWT, modifyActiveStatus);
router.put("/finish-courses/:studentId", validateInstitutionJWT, finishCoursesById);
router.put("/update-semester/:studentId", validateInstitutionJWT, updateStudentSemester);
router.put("/update-hostel/:studentId", validateUserJWT, updateHostelStatus);

// DELETE ROUTES
router.delete("/delete-student/:studentId", validateInstitutionJWT, deleteStudent);

export default router;