import { Router } from "express";
import {
    getBatchCourseComponents,
    getBatchCourseMatrix,
    getStudentCourseDetail,
    getStudentMarksLine,
    recordMarks
} from "../controllers/marksRecord.controller.js";
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";

const router = Router();

// GET ROUTES
router.get("/course/:courseId/components", validateUserJWT, getBatchCourseComponents);
router.get("/matrix", validateUserJWT, getBatchCourseMatrix);
router.get("/student/:studentId/all", validateUserJWT, getStudentMarksLine);
router.get("/student/:studentId/course/:courseId", validateUserJWT, getStudentCourseDetail);

// POST ROUTES
router.post("/record", validateUserJWT, recordMarks);

export default router;
