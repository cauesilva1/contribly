export interface IProject {
    id?: number;
    title: string;
    description: string;
    ownerId: number;
    githubLink: string;
    languages: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IProjectWithRelations extends IProject {
    owner?: {
        id: number;
        name: string;
        email: string;
        photoURL: string | null;
    };
    participants?: Array<{
        user: {
            id: number;
            name: string;
            email: string;
            photoURL: string | null;
        };
    }>;
}

export interface IProjectRepository {
    create(project: IProject): Promise<IProject>;
    findById(id: number): Promise<IProjectWithRelations | null>;
    findAll(): Promise<IProjectWithRelations[]>;
    update(id: number, project: Partial<IProject>): Promise<IProject>;
    delete(id: number): Promise<void>;
} 