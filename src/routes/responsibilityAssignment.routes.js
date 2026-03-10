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

// GET ROUTES
router.get("/", getAllAssignments);
router.get("/responsibility/:responsibilityId", getAssignmentsByResponsibility);
router.get("/user/:userId", getAssignmentsByUser);
router.get("/active", getActiveAssignments);

// POST ROUTES
router.post("/", validateInstitutionJWT, createResponsibilityAssignment);

// PUT ROUTES
router.put("/:id", validateInstitutionJWT, updateResponsibilityAssignment);

// PATCH ROUTES
router.patch("/:id/deactivate", validateInstitutionJWT, deactivateAssignment);

// DELETE ROUTES
router.delete("/:id", validateInstitutionJWT, deleteAssignment);

export default router;
