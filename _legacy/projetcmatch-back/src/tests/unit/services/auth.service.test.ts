import { AuthService } from '../../../services/auth.service';
import { UserRepository } from '../../../repositories/user.repository';
import { IUser } from '../../../interfaces/user.interface';
import axios from 'axios';

// Mock do UserRepository
jest.mock('../../../repositories/user.repository');
// Mock do axios
jest.mock('axios');

describe('AuthService', () => {
    let authService: AuthService;
    let userRepository: jest.Mocked<UserRepository>;
    const mockUser: IUser = {
        id: 1,
        uid: '123',
        name: 'Test User',
        email: 'test@example.com',
        photoURL: 'http://example.com/photo.jpg',
        lastLoginAt: new Date()
    };

    beforeEach(() => {
        // Criar o mock do UserRepository
        userRepository = {
            findByUid: jest.fn(),
            create: jest.fn(),
            update: jest.fn()
        } as unknown as jest.Mocked<UserRepository>;

        // Substituir a instância do UserRepository no AuthService
        UserRepository.prototype.findByUid = userRepository.findByUid;
        UserRepository.prototype.create = userRepository.create;
        UserRepository.prototype.update = userRepository.update;

        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('authenticateGitHubUser', () => {
        it('should create a new user if not exists', async () => {
            const mockGithubResponse = {
                data: {
                    id: '123',
                    name: 'Test User',
                    email: 'test@example.com',
                    avatar_url: 'http://example.com/photo.jpg'
                }
            };

            (axios.get as jest.Mock).mockResolvedValue(mockGithubResponse);
            userRepository.findByUid.mockResolvedValue(null);
            userRepository.create.mockResolvedValue(mockUser);

            const result = await authService.authenticateGitHubUser('token123');

            expect(axios.get).toHaveBeenCalledWith('https://api.github.com/user', {
                headers: {
                    Authorization: 'Bearer token123',
                    Accept: 'application/vnd.github.v3+json'
                }
            });
            expect(userRepository.findByUid).toHaveBeenCalledWith('123');
            expect(userRepository.create).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it('should update existing user', async () => {
            const mockGithubResponse = {
                data: {
                    id: '123',
                    name: 'Updated Name',
                    email: 'test@example.com',
                    avatar_url: 'http://example.com/photo.jpg'
                }
            };

            (axios.get as jest.Mock).mockResolvedValue(mockGithubResponse);
            userRepository.findByUid.mockResolvedValue(mockUser);
            userRepository.update.mockResolvedValue(mockUser);

            const result = await authService.authenticateGitHubUser('token123');

            expect(axios.get).toHaveBeenCalledWith('https://api.github.com/user', {
                headers: {
                    Authorization: 'Bearer token123',
                    Accept: 'application/vnd.github.v3+json'
                }
            });
            expect(userRepository.findByUid).toHaveBeenCalledWith('123');
            expect(userRepository.update).toHaveBeenCalledWith(1, expect.any(Object));
            expect(result).toEqual(mockUser);
        });

        it('should handle authentication error', async () => {
            (axios.get as jest.Mock).mockRejectedValue(new Error('GitHub API error'));

            await expect(authService.authenticateGitHubUser('token123')).rejects.toThrow('Falha na autenticação com GitHub');
        });
    });
}); 