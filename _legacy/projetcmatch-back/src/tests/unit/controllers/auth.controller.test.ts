import { AuthController } from '../../../controllers/auth.controller';
import { AuthService } from '../../../services/auth.service';
import { Request, Response } from 'express';
import { IUser } from '../../../interfaces/user.interface';

// Mock do AuthService
jest.mock('../../../services/auth.service');

describe('AuthController', () => {
    let authController: AuthController;
    let authService: jest.Mocked<AuthService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    const mockUser: IUser = {
        id: 1,
        uid: '123',
        name: 'Test User',
        email: 'test@example.com',
        photoURL: 'http://example.com/photo.jpg',
        lastLoginAt: new Date()
    };

    beforeEach(() => {
        // Criar o mock do AuthService
        authService = {
            authenticateGitHubUser: jest.fn()
        } as unknown as jest.Mocked<AuthService>;

        // Substituir a instância do AuthService no AuthController
        AuthService.prototype.authenticateGitHubUser = authService.authenticateGitHubUser;
        
        authController = new AuthController();
        
        mockRequest = {
            body: {
                token: 'token123'
            }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
    });

    describe('authenticateGitHub', () => {
        it('should authenticate user successfully', async () => {
            authService.authenticateGitHubUser.mockResolvedValue(mockUser);

            await authController.authenticateGitHub(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(authService.authenticateGitHubUser).toHaveBeenCalledWith('token123');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
        });

        it('should return 400 if token is not provided', async () => {
            mockRequest.body = {};

            await authController.authenticateGitHub(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token não fornecido.' });
        });

        it('should handle authentication error', async () => {
            const error = new Error('Authentication failed');
            authService.authenticateGitHubUser.mockRejectedValue(error);

            await authController.authenticateGitHub(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(authService.authenticateGitHubUser).toHaveBeenCalledWith('token123');
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
        });
    });
}); 