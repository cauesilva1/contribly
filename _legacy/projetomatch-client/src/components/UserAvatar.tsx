"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface UserAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  userId?: string;
}

export function UserAvatar({ 
  src, 
  alt = "Avatar do usuário",
  fallback = "U",
  className = "",
  userId
}: UserAvatarProps) {
  const router = useRouter();

  const handleClick = () => {
    if (userId) {
      router.push(`/Profile/${userId}`);
    }
  };

  return (
    <Avatar 
      className={`cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <AvatarImage 
        src={src} 
        alt={alt}
      />
      <AvatarFallback>
        {fallback.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
} 