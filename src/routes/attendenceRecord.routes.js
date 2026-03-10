import { Router } from "express";

import {
    markAttendance,
    studentCourseAttendance,
    batchDefaulters,
    studentFullReport,
    batchCourseMatrix,
    studentCourseDatewise,
    sessionSlotAttendance
} from "../controllers/attendenceRecord.controller.js";
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";
import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";

const router = Router();

// GET ROUTES
router.get("/user/student/:studentId/course/:courseId", validateUserJWT, studentCourseAttendance);
router.get("/user/batch/defaulters", validateUserJWT, batchDefaulters);
router.get("/user/student/:studentId/report", validateUserJWT, studentFullReport);
router.get("/user/student/:studentId/course/:courseId/datewise", validateUserJWT, studentCourseDatewise);
router.get("/user/batch/matrix", validateUserJWT, batchCourseMatrix);
router.get("/user/session/:sessionId", validateUserJWT, sessionSlotAttendance);

router.get("/student/:studentId/course/:courseId", validateInstitutionJWT, studentCourseAttendance);
router.get("/batch/defaulters", validateInstitutionJWT, batchDefaulters);
router.get("/student/:studentId/report", validateInstitutionJWT, studentFullReport);
router.get("/student/:studentId/course/:courseId/datewise", validateInstitutionJWT, studentCourseDatewise);
router.get("/batch/matrix", validateInstitutionJWT, batchCourseMatrix);
router.get("/session/:sessionId", validateInstitutionJWT, sessionSlotAttendance);

// POST ROUTES
router.post("/user/:sessionId/mark", validateUserJWT, markAttendance);

export default router;
