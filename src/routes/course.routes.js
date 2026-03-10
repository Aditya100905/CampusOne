import { Router } from "express";
import { validateInstitutionJWT } from '../middlewares/institutionAuth.middleware.js';
import {
  checkCourseCodeExists,
  createCourse,
  deleteCourse,
  deleteCourseAndPrevCourseFromFaculty,
  deleteCourseAndPrevCourseFromStudent,
  findFacultiesByCourseAndBatch,
  findFacultiesByPrevCourseAndBatch,
  findFacultyByCourseId,
  findFacultyByPrevCourseId,
  findStudentByCourseId,
  findStudentByInstitutionCourse,
  findStudentByInstitutionPrevCourse,
  findStudentByPrevCourseId,
  finishCourseForFaculties,
  getCourseById,
  getCourseByInstitution,
  getCoursesByDepartment,
  modifyStatus,
  updateCourse
} from "../controllers/course.controller.js";

const router = Router();

// GET ROUTES
router.get("/faculty/course/:courseId/institution/:institutionId/batch/:batch", findFacultiesByCourseAndBatch);
router.get("/faculty/prev-course/:courseId/institution/:institutionId/batch/:batch", findFacultiesByPrevCourseAndBatch);

router.get("/faculty/course/:courseId/institution/:institutionId", findFacultyByCourseId);
router.get("/faculty/prev-course/:courseId/institution/:institutionId", findFacultyByPrevCourseId);
router.get("/faculty/pull-course/:courseId/institution/:institutionId", deleteCourseAndPrevCourseFromFaculty);
router.get("/faculty/finish-all/:courseId/institution/:institutionId", finishCourseForFaculties);

router.get("/student/course/:courseId/department/:departmentId", findStudentByCourseId);
router.get("/student/prev-course/:courseId/department/:departmentId", findStudentByPrevCourseId);

router.get("/student/course/:courseId/institution/:institutionId", findStudentByInstitutionCourse);
router.get("/student/prev-course/:courseId/institution/:institutionId", findStudentByInstitutionPrevCourse);
router.get("/student/pull-course/:courseId/institution/:institutionId", deleteCourseAndPrevCourseFromStudent);

router.get("/department/:departmentId", getCoursesByDepartment);
router.get("/institution/:institutionId", getCourseByInstitution);
router.get("/:courseId", getCourseById);

// POST ROUTES
router.post("/create-course", validateInstitutionJWT, createCourse);
router.post("/code-exists", validateInstitutionJWT, checkCourseCodeExists);

// PUT ROUTES
router.put("/:courseId", validateInstitutionJWT, updateCourse);
router.put("/change-status/:courseId", validateInstitutionJWT, modifyStatus);

// DELETE ROUTES
router.delete("/:courseId", validateInstitutionJWT, deleteCourse);

export default router;