import { Request, Response, NextFunction } from 'express';

export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        return; // Finaliza a execução para evitar chamar `next()`
    }

    if (password.length < 6) {
        res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
        return; // Finaliza a execução para evitar chamar `next()`
    }

    next(); // Continua para o próximo middleware ou rota
};