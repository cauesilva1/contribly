"use client";

import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileOwnerInfoProps {
  userData: {
    name: string;
    avatarUrl: string;
    bio: string;
    githubUrl: string;
    email: string;
  };
  onUpdateProfile: (data: any) => Promise<void>;
}

export function ProfileOwnerInfo({ userData, onUpdateProfile }: ProfileOwnerInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateProfile(formData);
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <UserAvatar 
          src={formData.avatarUrl} 
          alt={formData.name}
          className="w-20 h-20"
        />
        <div>
          <h2 className="text-2xl font-bold">{formData.name}</h2>
          <p className="text-gray-600">{formData.bio}</p>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Salvar</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">GitHub</h3>
            <a 
              href={formData.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {formData.githubUrl}
            </a>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p>{formData.email}</p>
          </div>

          <Button onClick={() => setIsEditing(true)}>
            Editar Perfil
          </Button>
        </div>
      )}
    </Card>
  );
} 