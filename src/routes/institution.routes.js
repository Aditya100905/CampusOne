import { Router } from "express";
import {
    registerInstitution,
    loginInstitution,
    logoutInstitution,
    getCurrentInstitution,
    forgotInstitutionPassword,
    resetInstitutionPassword,
    sendInstitutionEmailVerification,
    verifyInstitutionEmail,
    updateInstitutionAvatar,
    updateInstitution,
    deleteInstitution,
    refreshAccessToken,
    checkInstitutionCodeExists,
    getAllInstitutions,
    getInstitutionById,
} from "../controllers/institution.controller.js";

import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// PUBLIC ROUTES
router.get("/", getAllInstitutions);
router.post("/register", registerInstitution);
router.post("/login", authLimiter, loginInstitution);
router.post("/refresh", refreshAccessToken);
router.post("/forgot-password", forgotInstitutionPassword);
router.post("/reset-password/:token", resetInstitutionPassword);
router.get("/verify-email/:token", verifyInstitutionEmail);
router.get("/:institutionId", getInstitutionById);

// PROTECTED ROUTES
router.get("/current-institution", validateInstitutionJWT, getCurrentInstitution);
router.post("/logout", validateInstitutionJWT, logoutInstitution);
router.post("/code-exists", checkInstitutionCodeExists);
router.post(
    "/send-email-verification",
    validateInstitutionJWT,
    sendInstitutionEmailVerification
);
router.post(
    "/update-avatar",
    validateInstitutionJWT,
    upload.single("avatar"),
    updateInstitutionAvatar
);
router.put(
    "/update",
    validateInstitutionJWT,
    updateInstitution
);
router.delete("/delete/:institutionId", validateInstitutionJWT, deleteInstitution);

export default router;
