import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';

const router = Router();
const projectController = new ProjectController();

router.post('/', projectController.createProject.bind(projectController));
router.get('/', projectController.getAllProjects.bind(projectController));
router.get('/:id', projectController.getProject.bind(projectController));
router.put('/:id', projectController.updateProject.bind(projectController));
router.delete('/:id', projectController.deleteProject.bind(projectController));

export default router; 