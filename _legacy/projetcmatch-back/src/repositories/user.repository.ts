import { database } from '../config/database';
import { IUser, IUserRepository } from '../interfaces/user.interface';

export class UserRepository implements IUserRepository {
    private prisma = database.getPrisma();

    async create(user: IUser): Promise<IUser> {
        return this.prisma.user.create({
            data: {
                uid: user.uid,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                lastLoginAt: user.lastLoginAt
            }
        });
    }

    async findByUid(uid: string): Promise<IUser | null> {
        return this.prisma.user.findUnique({
            where: { uid }
        });
    }

    async findById(id: number): Promise<IUser | null> {
        return this.prisma.user.findUnique({
            where: { id }
        });
    }

    async update(id: number, user: Partial<IUser>): Promise<IUser> {
        return this.prisma.user.update({
            where: { id },
            data: {
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                lastLoginAt: user.lastLoginAt
            }
        });
    }
} 