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

// GET ROUTES
router.get("/institution/:institutionId", getDepartmentsByInstitution);
router.get("/:departmentId", getDepartmentById);

// POST ROUTES
router.post("/code-exists", validateInstitutionJWT, checkDepartmentCodeExists);
router.post("/create-department", validateInstitutionJWT, createDepartment);
router.post("/add-hod/:departmentId", validateInstitutionJWT, addHod);
router.post("/remove-hod/:departmentId", validateInstitutionJWT, removeHod);

// PUT ROUTES
router.put("/update-department/:departmentId", validateInstitutionJWT, updateDepartment);

// DELETE ROUTES
router.delete("/delete-department/:departmentId", validateInstitutionJWT, deleteDepartment);

export default router;