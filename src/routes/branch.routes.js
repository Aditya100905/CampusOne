import { Router } from 'express';
import {
  changeBranchStatus,
  checkBranchCodeExists,
  createBranch,
  deleteBranch,
  getBranchByDepartment,
  getBranchById,
  getBranchesByInstitution,
  updateBranch
} from '../controllers/branch.controller.js';
import { validateInstitutionJWT } from '../middlewares/institutionAuth.middleware.js';

const router = Router();

// PUBLIC ROUTES
router.get('/institutions/:institutionId', getBranchesByInstitution);
router.get('/departments/:departmentId', getBranchByDepartment);
router.get('/:branchId', getBranchById);

// MANAGEMENT ROUTES
router.post('/institutions/:institutionId', createBranch);
router.put('/:branchId', updateBranch);
router.delete('/:branchId', deleteBranch);
router.patch('/:branchId/status', changeBranchStatus);

// INSTITUTION-AUTH ROUTES
router.post("/code-exists", validateInstitutionJWT, checkBranchCodeExists);

export default router;