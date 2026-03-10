import express from "express";
import { validateUserJWT } from '../middlewares/userAuth.middleware.js';
import {
    createApplication,
    forwardApplication,
    approveApplication,
    rejectApplication,
    getApplicationById,
    getMyApplications,
    getPendingApprovals,
    getProcessedByMe
} from "../controllers/application.controller.js";

const router = express.Router();

// GET ROUTES
router.get("/my", validateUserJWT, getMyApplications);
router.get("/faculty/pending", validateUserJWT, getPendingApprovals);
router.get("/faculty/processed", validateUserJWT, getProcessedByMe);
router.get("/:applicationId", getApplicationById);

// POST ROUTES
router.post("/", validateUserJWT, createApplication);
router.post("/:applicationId/forward", validateUserJWT, forwardApplication);
router.post("/:applicationId/approve", validateUserJWT, approveApplication);
router.post("/:applicationId/reject", validateUserJWT, rejectApplication);

export default router;
