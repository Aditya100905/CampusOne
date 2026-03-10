import { Router } from "express";
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    forgotUserPassword,
    resetUserPassword,
    sendUserEmailVerification,
    verifyUserEmail,
    updateUserAvatar,
    updateUser,
    getFacultyByUserId,
    deleteUser,
    refreshAccessToken,
} from "../controllers/user.controller.js";
import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// GET ROUTES
router.get("/verify-email/:token", verifyUserEmail);
router.get("/current-user", validateUserJWT, getCurrentUser);
router.get(
    "/faculty",
    validateUserJWT,
    getFacultyByUserId
);

// POST ROUTES
router.post("/register", validateInstitutionJWT, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/forgot-password", forgotUserPassword);
router.post("/reset-password/:token", resetUserPassword);
router.post("/logout", validateUserJWT, logoutUser);
router.post(
    "/send-email-verification",
    validateUserJWT,
    sendUserEmailVerification
);
router.post(
    "/update-avatar",
    validateUserJWT,
    upload.single("avatar"),
    updateUserAvatar
);

// PUT ROUTES
router.put(
    "/update",
    validateUserJWT,
    updateUser
);

// DELETE ROUTES
router.delete("/delete/:userId", validateInstitutionJWT, deleteUser);

export default router;