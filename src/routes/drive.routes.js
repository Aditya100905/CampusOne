import { Router } from "express";
import { validateUserJWT } from '../middlewares/userAuth.middleware.js';
import {
    createDrive,
    updateDrive,
    updateStatus,
    updateResults,
    deleteDrive,
    getDrivesByInstitution,
    getDriveById,
    getDrivesByBatch
} from '../controllers/drive.controller.js';


const router = Router();

router.post("/create", validateUserJWT, createDrive);

router.put("/update/:id", validateUserJWT, updateDrive);
router.put("/update-status/:id", validateUserJWT, updateStatus);
router.put("/update-results/:id", validateUserJWT, updateResults);

router.delete("/delete/:id", validateUserJWT, deleteDrive);

router.get("/get/:id", validateUserJWT, getDriveById);
router.get("/batch/:batch", validateUserJWT, getDrivesByBatch);
router.get("/institution/:institutionId", validateUserJWT, getDrivesByInstitution);

export default router;
