import { Router } from 'express';
import authRoutes from './auth';
import patientRoutes from './patients';
import consultationRoutes from './consultations';
import notificationRoutes from './notifications';
import adminRoutes from './admin';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/consultations', consultationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
