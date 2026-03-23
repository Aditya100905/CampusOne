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
    getApplicationsByInstitute,
    submitAdmissionApplication,
    approveAdmissionApplication,
    rejectAdmissionApplication,
    getApplicationsWithFilters,
    uploadApplicationDocument,
    deleteApplicationDocument,
    updateApplicationDocumentStatus,
    updateformStatus,
    updateApplicationDocument
} from "../controllers/admissionApplication.controller.js";
import { validateAdmissionJWT } from "../middlewares/admissionAuth.middleware.js";
import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

// GET ROUTES
router.get("/verify-email/:token", verifyAdmissionEmail);
router.get("/status/:applicationNumber", validateAdmissionJWT, getApplicationStatusByNumber);
router.get("/me", validateAdmissionJWT, getCurrentAdmissionApplication);
router.get("/institution/:institutionId/branch/:branchId", validateInstitutionJWT, getApplicationsByInstituteAndBranch);
router.get("/institution/:institutionId", validateInstitutionJWT, getApplicationsByInstitute);
router.get("/filters", validateInstitutionJWT, getApplicationsWithFilters);
router.get("/:applicationId", validateInstitutionJWT, getApplicationById);

// POST ROUTES
router.post("/register", registerAdmissionApplication);
router.post("/login", authLimiter, loginAdmissionApplication);
router.post("/forgot-password", forgotAdmissionPassword);
router.post("/reset-password/:token", resetAdmissionPassword);
router.post("/logout", validateAdmissionJWT, logoutAdmissionApplication);
router.post("/refresh-token", refreshAdmissionAccessToken);
router.post("/send-verification-email", validateAdmissionJWT, sendAdmissionEmailVerification);
router.post("/submit", validateAdmissionJWT, submitAdmissionApplication);
router.post("/:applicationId/review-log", validateInstitutionJWT, addAdmissionReviewLog);
router.post("/:applicationId/document", validateAdmissionJWT, upload.single("document"), uploadApplicationDocument);

// PUT ROUTES
router.put("/me", validateAdmissionJWT, updateAdmissionApplication);
router.put("/:applicationId/status", validateInstitutionJWT, updateAdmissionApplicationStatus);
router.put("/:applicationId/approve", validateInstitutionJWT, approveAdmissionApplication);
router.put("/:applicationId/reject", validateInstitutionJWT, rejectAdmissionApplication);
router.put("/:applicationId/form-status", validateAdmissionJWT, updateformStatus);
router.put("/:applicationId/set-status", validateInstitutionJWT, updateformStatus);

router.put("/:applicationId/document/:publicId/status", validateInstitutionJWT, updateApplicationDocumentStatus);
router.put('/:applicationId/document-status/:publicId', validateAdmissionJWT, updateApplicationDocumentStatus);

router.put('/:applicationId/update-document/:publicId', validateAdmissionJWT, upload.single("document"), updateApplicationDocument);

// DELETE ROUTES
router.delete("/:applicationId", validateInstitutionJWT, deleteAdmissionApplication);
router.delete("/:applicationId/document/:publicId", validateAdmissionJWT, deleteApplicationDocument);

export default router;
