import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

interface ProfileData {
  name: string;
  avatarUrl: string;
  bio: string;
  githubUrl: string;
  email: string;
}

export function useProfile(initialProfile: ProfileData) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (data: ProfileData) => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_URL_API}/profile`,
        data
      );
      setProfile(response.data);
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  return {
    profile,
    isEditing,
    isLoading,
    handleUpdateProfile,
    toggleEditing
  };
} 