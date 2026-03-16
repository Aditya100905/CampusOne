import { Router } from "express";
import { validateUserJWT } from '../middlewares/userAuth.middleware.js';
import { createNotification, deleteNotification, getNotificationByBatch, getNotificationByEmail, modifyActiveStatus } from "../controllers/notification.controller.js"
import { validateInstitutionJWT } from '../middlewares/institutionAuth.middleware.js';

const router = Router();

router.post('/', validateInstitutionJWT, createNotification);
router.post('/create', validateUserJWT, createNotification);

router.put('/:id/status', validateInstitutionJWT, modifyActiveStatus);
router.put('/:id/change-status', validateUserJWT, modifyActiveStatus);

router.delete('/:id', validateInstitutionJWT, deleteNotification);
router.delete('/:id/delete', validateUserJWT, deleteNotification);

router.get('/batch/:batch', validateUserJWT, getNotificationByBatch);
router.get('/email/:email', validateUserJWT, getNotificationByEmail);

export default router;