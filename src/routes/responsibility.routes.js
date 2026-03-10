import express from "express";
import {
    createResponsibility,
    getResponsibilitiesByInstitution,
    getResponsibilityById,
    updateResponsibility,
    deleteResponsibility,
    changeActiveStatus,
} from "../controllers/responsibility.controller.js";

import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";

const router = express.Router();

// GET ROUTES
router.get("/institution/:institutionId", getResponsibilitiesByInstitution);
router.get("/:responsibilityId", getResponsibilityById);

// POST ROUTES
router.post("/", validateInstitutionJWT, createResponsibility);

// PUT ROUTES
router.put("/change-status/:responsibilityId", validateInstitutionJWT, changeActiveStatus);
router.put("/:responsibilityId", validateInstitutionJWT, updateResponsibility);

// DELETE ROUTES
router.delete("/:responsibilityId", validateInstitutionJWT, deleteResponsibility);

export default router;
