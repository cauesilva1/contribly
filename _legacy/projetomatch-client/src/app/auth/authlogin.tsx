import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const loginWithGithub = async () => {
    // Verifica se o app já foi inicializado
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const provider = new GithubAuthProvider();
    const auth = getAuth(app);

    try {
        const result = await signInWithPopup(auth, provider);

        // Obtenha o token do GitHub
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential ? credential.accessToken : null;

        if (!token) {
            throw new Error("Token não encontrado.");
        }

        // Informações do usuário
        const user = result.user;

        return {
            token, // Token de acesso do GitHub
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                providerData: user.providerData,
            },
        };
    } catch (error) {
        console.error("Erro durante o login:", error);
        throw error;
    }
};