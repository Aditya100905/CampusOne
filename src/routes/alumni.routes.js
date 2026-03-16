import { Router } from "express";
import { createAlumni, deleteAlumni, getAlumniById, getAlumniByInstitution, getUnverifiedAlumni, updateAlumni, verifyAlumni } from "../controllers/alumni.controller.js"
import { validateInstitutionJWT } from '../middlewares/institutionAuth.middleware.js';
import { validateUserJWT } from '../middlewares/userAuth.middleware.js';

const router = Router();

router.post('/create', validateUserJWT, createAlumni);

router.put('/verify/:id', validateInstitutionJWT, verifyAlumni);
router.put('/update/:id', validateUserJWT, updateAlumni);

router.get('/institution/:institutionId', validateInstitutionJWT, getAlumniByInstitution);
router.get('/unverified/:institutionId', validateInstitutionJWT, getUnverifiedAlumni);
router.get('/:id', getAlumniById);

router.delete('/delete/:id', validateInstitutionJWT, deleteAlumni);

export default router;