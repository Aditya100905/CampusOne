import express from "express";
import {
    registerAdmissionApplication,
    loginAdmissionApplication,
    logoutAdmissionApplication,
    refreshAdmissionAccessToken,
    getCurrentAdmissionApplication,
    getApplicationStatusByNumber,
    updateAdmissionApplication,
    updateAdmissionApplicationStatus,
    addAdmissionReviewLog,
    deleteAdmissionApplication,
    forgotAdmissionPassword,
    resetAdmissionPassword,
    sendAdmissionEmailVerification,
    verifyAdmissionEmail,
    getApplicationById,
    getApplicationsByInstituteAndBranch,
    getApplicationsByInstitute
} from "../controllers/admissionApplication.controller.js";
import { validateAdmissionJWT } from "../middlewares/admissionAuth.middleware.js";
import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

// GET ROUTES
router.get("/verify-email/:token", verifyAdmissionEmail);
router.get("/status/:applicationNumber", validateAdmissionJWT, getApplicationStatusByNumber);
router.get("/me", validateAdmissionJWT, getCurrentAdmissionApplication);
router.get("/institution/:institutionId/branch/:branchId", validateInstitutionJWT, getApplicationsByInstituteAndBranch);
router.get("/institution/:institutionId", validateInstitutionJWT, getApplicationsByInstitute);
router.get("/:applicationId", validateInstitutionJWT, getApplicationById);

// POST ROUTES
router.post("/register", registerAdmissionApplication);
router.post("/login", authLimiter, loginAdmissionApplication);
router.post("/forgot-password", forgotAdmissionPassword);
router.post("/reset-password/:token", resetAdmissionPassword);
router.post("/logout", logoutAdmissionApplication);
router.post("/refresh-token", refreshAdmissionAccessToken);
router.post("/send-verification-email", validateAdmissionJWT, sendAdmissionEmailVerification);
router.post("/:applicationId/review-log", validateInstitutionJWT, addAdmissionReviewLog);

// PUT ROUTES
router.put("/me", validateAdmissionJWT, updateAdmissionApplication);
router.put("/:applicationId/status", validateInstitutionJWT, updateAdmissionApplicationStatus);

// DELETE ROUTES
router.delete("/:applicationId", validateInstitutionJWT, deleteAdmissionApplication);

export default router;
