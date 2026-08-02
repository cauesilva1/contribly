"use client";

import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { ReactNode } from "react";

interface ProfileOwnerInfoProps {
  userData: {
    name: string;
    avatarUrl: string;
    bio: string;
    githubUrl: string;
    email: string;
  };
  children?: (props: {
    profile: typeof userData;
    isEditing: boolean;
    isLoading: boolean;
    handleUpdateProfile: (data: typeof userData) => Promise<void>;
    toggleEditing: () => void;
  }) => ReactNode;
}

export function ProfileOwnerInfo({ userData, children }: ProfileOwnerInfoProps) {
  const { profile, isEditing, isLoading, handleUpdateProfile, toggleEditing } = useProfile(userData);

  if (children) {
    return children({
      profile,
      isEditing,
      isLoading,
      handleUpdateProfile,
      toggleEditing
    });
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <UserAvatar 
          src={profile.avatarUrl} 
          alt={profile.name}
          className="w-20 h-20"
        />
        <div>
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <p className="text-gray-600">{profile.bio}</p>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateProfile(profile);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="outline" onClick={toggleEditing}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">GitHub</h3>
            <a 
              href={profile.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {profile.githubUrl}
            </a>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p>{profile.email}</p>
          </div>

          <Button onClick={toggleEditing}>
            Editar Perfil
          </Button>
        </div>
      )}
    </Card>
  );
} 