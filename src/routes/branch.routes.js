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

// GET ROUTES
router.get('/institutions/:institutionId', getBranchesByInstitution);
router.get('/departments/:departmentId', getBranchByDepartment);
router.get('/:branchId', getBranchById);

// POST ROUTES
router.post('/institutions/:institutionId', createBranch);
router.post("/code-exists", validateInstitutionJWT, checkBranchCodeExists);

// PUT ROUTES
router.put('/:branchId', updateBranch);

// PATCH ROUTES
router.patch('/:branchId/status', changeBranchStatus);

// DELETE ROUTES
router.delete('/:branchId', deleteBranch);

export default router;