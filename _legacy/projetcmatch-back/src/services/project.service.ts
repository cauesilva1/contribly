import { ProjectRepository } from '../repositories/project.repository';
import { IProject, IProjectWithRelations } from '../interfaces/project.interface';

export class ProjectService {
    private projectRepository: ProjectRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
    }

    async createProject(project: IProject): Promise<IProject> {
        // Aqui podemos adicionar validações e regras de negócio
        return this.projectRepository.create(project);
    }

    async getProjectById(id: number): Promise<IProjectWithRelations | null> {
        return this.projectRepository.findById(id);
    }

    async getAllProjects(): Promise<IProjectWithRelations[]> {
        return this.projectRepository.findAll();
    }

    async updateProject(id: number, project: Partial<IProject>): Promise<IProject> {
        return this.projectRepository.update(id, project);
    }

    async deleteProject(id: number): Promise<void> {
        await this.projectRepository.delete(id);
    }
} 