import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async authenticateGitHub(req: Request, res: Response): Promise<void> {
        const { token } = req.body;

        if (!token) {
            res.status(400).json({ error: 'Token não fornecido.' });
            return;
        }

        try {
            const user = await this.authService.authenticateGitHubUser(token);
            res.status(200).json(user);
        } catch (error) {
            console.error('Erro na autenticação:', error);
            res.status(500).json({ 
                error: error instanceof Error ? error.message : 'Erro desconhecido na autenticação' 
            });
        }
    }
} 