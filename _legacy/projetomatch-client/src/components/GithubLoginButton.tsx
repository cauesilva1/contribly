"use client";

import { Button } from "@/components/ui/button";
import { loginWithGithub } from "@/app/auth/authlogin";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useState } from "react";
import { toast } from "sonner";

interface GithubLoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function GithubLoginButton({ className, children }: GithubLoginButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { token } = await loginWithGithub();
      
      if (!token) {
        throw new Error("Token não recebido do GitHub");
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL_API}/auth/github`,
        { token }
      );

      if (response.data) {
        Cookies.set("access_token", token, {
          path: "/",
          sameSite: "strict",
          expires: 7,
          secure: process.env.NODE_ENV === "production",
        });
        
        localStorage.setItem("user", JSON.stringify(response.data));
        toast.success("Login realizado com sucesso!");
        router.push("/InicialPage");
      }
    } catch (error) {
      console.error("Erro no processo de login:", error);
      toast.error("Erro ao realizar login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleLogin} 
      className={className}
      disabled={isLoading}
      aria-label="Login com GitHub"
    >
      {isLoading ? "Carregando..." : (children || "Login com GitHub")}
    </Button>
  );
} 