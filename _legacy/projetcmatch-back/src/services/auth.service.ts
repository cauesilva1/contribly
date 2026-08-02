import axios from 'axios';
import { UserRepository } from '../repositories/user.repository';
import { IUser } from '../interfaces/user.interface';

export class AuthService {
    private userRepository: UserRepository;
    private githubApiUrl = 'https://api.github.com/user';

    constructor() {
        this.userRepository = new UserRepository();
    }

    async authenticateGitHubUser(token: string): Promise<IUser> {
        try {
            // Busca informações do usuário no GitHub
            const response = await axios.get(this.githubApiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            });

            const githubUser = response.data;

            // Verifica se o usuário já existe
            let user = await this.userRepository.findByUid(githubUser.id.toString());

            if (!user) {
                // Cria novo usuário se não existir
                user = await this.userRepository.create({
                    uid: githubUser.id.toString(),
                    name: githubUser.name || githubUser.login,
                    email: githubUser.email,
                    photoURL: githubUser.avatar_url,
                    lastLoginAt: new Date()
                });
            } else {
                // Atualiza informações do usuário existente
                user = await this.userRepository.update(user.id!, {
                    name: githubUser.name || githubUser.login,
                    email: githubUser.email,
                    photoURL: githubUser.avatar_url,
                    lastLoginAt: new Date()
                });
            }

            return user;
        } catch (error) {
            console.error('Erro ao autenticar usuário via GitHub:', error);
            throw new Error('Falha na autenticação com GitHub');
        }
    }
} 