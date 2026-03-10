import express from "express";
import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import {
    createResponsibilityAssignment,
    getAllAssignments,
    getAssignmentsByResponsibility,
    getAssignmentsByUser,
    getActiveAssignments,
    updateResponsibilityAssignment,
    deactivateAssignment,
    deleteAssignment
} from "../controllers/responsibilityAssignment.controller.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", getAllAssignments);
router.get("/responsibility/:responsibilityId", getAssignmentsByResponsibility);
router.get("/user/:userId", getAssignmentsByUser);
router.get("/active", getActiveAssignments);

// INSTITUTION-AUTH ROUTES
router.post("/", validateInstitutionJWT, createResponsibilityAssignment);
router.put("/:id", validateInstitutionJWT, updateResponsibilityAssignment);
router.patch("/:id/deactivate", validateInstitutionJWT, deactivateAssignment);
router.delete("/:id", validateInstitutionJWT, deleteAssignment);

export default router;
