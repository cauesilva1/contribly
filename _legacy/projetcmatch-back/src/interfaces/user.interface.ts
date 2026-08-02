export interface IUser {
    id?: number;
    uid: string;
    name: string;
    email: string;
    photoURL: string | null;
    lastLoginAt: Date;
    createdAt?: Date;
}

export interface IUserRepository {
    create(user: IUser): Promise<IUser>;
    findByUid(uid: string): Promise<IUser | null>;
    findById(id: number): Promise<IUser | null>;
    update(id: number, user: Partial<IUser>): Promise<IUser>;
} 