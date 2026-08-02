import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { database } from './config/database';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/auth', authRoutes);
app.use('/project', projectRoutes);

const PORT = process.env.PORT || 5000;

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Encerrando conexões do banco de dados...');
    await database.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Encerrando conexões do banco de dados...');
    await database.disconnect();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 