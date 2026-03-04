import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  getFacilities,
  createFacility,
  updateFacility,
  getAnalytics,
} from '../controllers/adminController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(authorizeRoles(UserRole.ADMINISTRATOR));

// User management
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Facility management
router.get('/facilities', getFacilities);
router.post('/facilities', createFacility);
router.put('/facilities/:id', updateFacility);

// Analytics
router.get('/analytics', getAnalytics);

export default router;
