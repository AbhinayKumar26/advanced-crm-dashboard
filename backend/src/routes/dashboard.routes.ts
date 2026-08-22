import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
// import { protect } from '../middleware/auth.middleware'; // Temporarily disabled to test UI

const router = Router();

// router.use(protect); // Temporarily disabled

router.get('/stats', getDashboardStats);

export default router;