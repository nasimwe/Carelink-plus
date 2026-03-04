import { Router } from 'express';
import {
  createConsultation,
  respondToConsultation,
  getConsultations,
  getConsultationById,
  closeConsultation,
  getDashboardStats,
} from '../controllers/consultationController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Get all consultations (filtered by role)
router.get('/', getConsultations);

// Get single consultation
router.get('/:id', getConsultationById);

// Clinician only - create consultation
router.post('/', authorizeRoles(UserRole.CLINICIAN), createConsultation);

// Specialist only - respond to consultation
router.put('/:id/respond', authorizeRoles(UserRole.SPECIALIST), respondToConsultation);

// Close consultation
router.put('/:id/close', closeConsultation);

export default router;
