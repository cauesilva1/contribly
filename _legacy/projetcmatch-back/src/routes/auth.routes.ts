import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/github', authController.authenticateGitHub.bind(authController));

export default router; 