import { Router } from "express";
import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import {
    addHod,
    checkDepartmentCodeExists,
    createDepartment,
    deleteDepartment,
    getDepartmentById,
    getDepartmentsByInstitution,
    removeHod,
    updateDepartment
} from "../controllers/department.controller.js";

const router = Router();

// PUBLIC ROUTES
router.get("/institution/:institutionId", getDepartmentsByInstitution);
router.get("/:departmentId", getDepartmentById);
router.post("/code-exists", validateInstitutionJWT, checkDepartmentCodeExists);

// PROTECTED ROUTES
router.post("/create-department", validateInstitutionJWT, createDepartment);
router.put("/update-department/:departmentId", validateInstitutionJWT, updateDepartment);
router.delete("/delete-department/:departmentId", validateInstitutionJWT, deleteDepartment);
router.post("/add-hod/:departmentId", validateInstitutionJWT, addHod);
router.post("/remove-hod/:departmentId", validateInstitutionJWT, removeHod);

export default router;