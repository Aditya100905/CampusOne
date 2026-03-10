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

// PUBLIC ROUTES
router.get("/institution/:institutionId", getResponsibilitiesByInstitution);
router.get("/:responsibilityId", getResponsibilityById);

// INSTITUTION-AUTH ROUTES
router.post("/", validateInstitutionJWT, createResponsibility);
router.put("/:responsibilityId", validateInstitutionJWT, updateResponsibility);
router.delete("/:responsibilityId", validateInstitutionJWT, deleteResponsibility);
router.put("/change-status/:responsibilityId", validateInstitutionJWT, changeActiveStatus);

export default router;
