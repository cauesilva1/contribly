import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { IProject } from '../interfaces/project.interface';

export class ProjectController {
    private projectService: ProjectService;

    constructor() {
        this.projectService = new ProjectService();
    }

    async createProject(req: Request, res: Response): Promise<void> {
        try {
            const project: IProject = req.body;
            const newProject = await this.projectService.createProject(project);
            res.status(201).json(newProject);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar projeto' });
        }
    }

    async getProject(req: Request, res: Response): Promise<void> {
        const { id } = req.query;

        if (!id) {
            res.status(400).json({ error: 'ID do projeto não fornecido' });
            return;
        }

        try {
            const project = await this.projectService.getProjectById(Number(id));
            if (!project) {
                res.status(404).json({ error: 'Projeto não encontrado' });
                return;
            }
            res.status(200).json(project);
        } catch (error) {
            console.error('Erro ao buscar projeto:', error);
            res.status(500).json({ error: 'Erro ao buscar projeto' });
        }
    }

    async getAllProjects(req: Request, res: Response): Promise<void> {
        try {
            const projects = await this.projectService.getAllProjects();
            res.status(200).json(projects);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar projetos' });
        }
    }

    async updateProject(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const project: Partial<IProject> = req.body;
            const updatedProject = await this.projectService.updateProject(Number(id), project);
            res.status(200).json(updatedProject);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar projeto' });
        }
    }

    async deleteProject(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.projectService.deleteProject(Number(id));
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Erro ao deletar projeto' });
        }
    }
} 