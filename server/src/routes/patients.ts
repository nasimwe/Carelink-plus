import { Router } from 'express';
import {
  createDischargeProfile,
  searchPatients,
  getPatientByCode,
  getPatientById,
  getMyPatients,
} from '../controllers/patientController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Specialist only routes
router.post('/discharge', authorizeRoles(UserRole.SPECIALIST), createDischargeProfile);
router.get('/my-patients', authorizeRoles(UserRole.SPECIALIST), getMyPatients);

// All authenticated users
router.get('/search', searchPatients);
router.get('/code/:code', getPatientByCode);
router.get('/:id', getPatientById);

export default router;
