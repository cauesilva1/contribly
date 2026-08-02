import { database } from '../config/database';
import { IProject, IProjectRepository, IProjectWithRelations } from '../interfaces/project.interface';

export class ProjectRepository implements IProjectRepository {
    private prisma = database.getPrisma();

    async create(project: IProject): Promise<IProject> {
        return this.prisma.project.create({
            data: {
                title: project.title,
                description: project.description,
                ownerId: project.ownerId,
                githubLink: project.githubLink,
                languages: project.languages
            }
        });
    }

    async findById(id: number): Promise<IProjectWithRelations | null> {
        return this.prisma.project.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        photoURL: true
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                photoURL: true
                            }
                        }
                    }
                }
            }
        });
    }

    async findAll(): Promise<IProjectWithRelations[]> {
        return this.prisma.project.findMany({
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        photoURL: true
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                photoURL: true
                            }
                        }
                    }
                }
            }
        });
    }

    async update(id: number, project: Partial<IProject>): Promise<IProject> {
        return this.prisma.project.update({
            where: { id },
            data: {
                title: project.title,
                description: project.description,
                githubLink: project.githubLink,
                languages: project.languages
            }
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.project.delete({
            where: { id }
        });
    }
} 