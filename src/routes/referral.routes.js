import { Router } from "express";
import {
    createReferral,
    deleteReferral,
    getReferralsByInstitution,
    modifyActiveStatus,
    updateReferral,
    updateReferralVerification
} from "../controllers/referral.controller.js"
import { validateUserJWT } from '../middlewares/userAuth.middleware.js';
import { validateInstitutionJWT } from '../middlewares/institutionAuth.middleware.js';

const router = Router();

router.post('/create', validateUserJWT, createReferral);

router.put('/verify/:referralId', validateInstitutionJWT, updateReferralVerification);
router.put('/active/:referralId', validateUserJWT, modifyActiveStatus);
router.put('/update/:referralId', validateUserJWT, updateReferral);

router.delete('/delete/:referralId', validateUserJWT, deleteReferral);

router.get('/institution/:institutionId', getReferralsByInstitution);

export default router;