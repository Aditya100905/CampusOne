import { Router } from "express";
import { addCampusLog, getActiveOutLogs, getCampusLogsByRollNumber, getLogsByDateRange, updateCampusLog } from "../controllers/campusLogs.controller.js";
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";


const router = Router();

router.get('/enrollmentNumber/:enrollmentNumber/:institutionId', validateUserJWT, getCampusLogsByRollNumber);
router.get('/dateRange/:institutionId', validateUserJWT, getLogsByDateRange);
router.get('/active/:institutionId', validateUserJWT, getActiveOutLogs);
router.post('/', validateUserJWT, addCampusLog);
router.put('/:logId', validateUserJWT, updateCampusLog);

export default router;