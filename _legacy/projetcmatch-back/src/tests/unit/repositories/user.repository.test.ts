import { UserRepository } from '../../../repositories/user.repository';
import { database } from '../../../config/database';
import { IUser } from '../../../interfaces/user.interface';

// Mock do Prisma
jest.mock('../../../config/database', () => ({
    database: {
        getPrisma: jest.fn().mockReturnValue({
            user: {
                create: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn()
            }
        })
    }
}));

describe('UserRepository', () => {
    let userRepository: UserRepository;
    const mockUser: IUser = {
        uid: '123',
        name: 'Test User',
        email: 'test@example.com',
        photoURL: 'http://example.com/photo.jpg',
        lastLoginAt: new Date()
    };

    beforeEach(() => {
        userRepository = new UserRepository();
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const prisma = database.getPrisma();
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

            const result = await userRepository.create(mockUser);

            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    uid: mockUser.uid,
                    name: mockUser.name,
                    email: mockUser.email,
                    photoURL: mockUser.photoURL,
                    lastLoginAt: mockUser.lastLoginAt
                }
            });
            expect(result).toEqual(mockUser);
        });
    });

    describe('findByUid', () => {
        it('should find a user by uid', async () => {
            const prisma = database.getPrisma();
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await userRepository.findByUid('123');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { uid: '123' }
            });
            expect(result).toEqual(mockUser);
        });

        it('should return null when user is not found', async () => {
            const prisma = database.getPrisma();
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await userRepository.findByUid('123');

            expect(result).toBeNull();
        });
    });
}); 