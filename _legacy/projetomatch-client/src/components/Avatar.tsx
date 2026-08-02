"use client";

import React, { useEffect, useState } from "react";

interface AvatarProps {
  src?: string; // URL da imagem
  alt?: string; // Texto alternativo para a imagem
  fallback?: string; // Texto de fallback (ex.: iniciais do usuário)
  className?: string; // Classes adicionais para estilização
  useLocalStorage?: boolean; // Define se deve buscar a URL no localStorage
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback = "?",
  className,
  useLocalStorage = true, // Por padrão, não busca no localStorage
}) => {
  const [localSrc, setLocalSrc] = useState<string | null>(null);

  useEffect(() => {
    if (useLocalStorage && !src) {
      // Busca a URL da foto do usuário no localStorage apenas se `useLocalStorage` for true
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          const userPhotoURL = parsedData.user?.photoURL || ""; // Acessa corretamente o photoURL
          setLocalSrc(userPhotoURL);
        } catch (error) {
          console.error("Erro ao parsear os dados do localStorage:", error);
        }
      }
    }
  }, [src, useLocalStorage]);

  const imageSrc = useLocalStorage ? localSrc : src; // Decide qual fonte usar

  return (
    <div
      className={`flex items-center justify-center rounded-full overflow-hidden bg-gray-200 text-gray-600 ${className}`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={alt || "Avatar"}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className="text-lg font-bold">{fallback}</span>
      )}
    </div>
  );
};

export default Avatar;