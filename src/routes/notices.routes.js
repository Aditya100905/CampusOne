import { Router } from "express";
import {
    createNotice,
    getNotices,
    getNoticeById,
    getNoticeByCourseId,
    getNoticeByDepartmentId,
    getNoticeByRole,
    updateNotice,
    deleteNotice
} from "../controllers/notices.controller.js";

import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// GET ROUTES
router.get("/", validateInstitutionJWT, getNotices);
router.get("/course/:courseId", validateInstitutionJWT, getNoticeByCourseId);
router.get("/department/:departmentId", validateInstitutionJWT, getNoticeByDepartmentId);
router.get("/role/:role", validateInstitutionJWT, getNoticeByRole);
router.get("/:noticeId", validateInstitutionJWT, getNoticeById);

// POST ROUTES
router.post("/", validateInstitutionJWT, upload.array("attachments"), createNotice);

// PATCH ROUTES
router.patch("/:noticeId", validateInstitutionJWT, upload.array("attachments"), updateNotice);

// DELETE ROUTES
router.delete("/:noticeId", validateInstitutionJWT, deleteNotice);

export default router;