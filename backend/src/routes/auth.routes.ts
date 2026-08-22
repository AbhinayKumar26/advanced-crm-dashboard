import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Routes are protected by Zod validation middleware before hitting controllers
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected route (requires valid JWT)
router.get('/me', protect, getMe);

export default router;