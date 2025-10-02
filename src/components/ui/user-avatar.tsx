import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Type for owner object (matches what we see in the codebase)
export type OwnerType =
  | {
      name?: string;
      image?: string;
    }
  | null
  | undefined;

// Helper function to safely extract owner data
export const getOwnerData = (
  owner: unknown
): { name: string; image: string } | null => {
  if (!owner || typeof owner !== "object") return null;

  const ownerObj = owner as {
    first_name?: string;
    last_name: string;
    image?: string;
  };
  const name = ownerObj.first_name + " " + ownerObj.last_name || "";
  const image = ownerObj.image || "";

  // Only return valid data if we have at least a name
  return name ? { name, image } : null;
};

// Generate initials from name
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// Size presets for different use cases
export const avatarSizes = {
  xs: "h-4 w-4", // Kanban cards
  sm: "h-6 w-6", // List view
  md: "h-8 w-8", // Item sheet
  lg: "h-10 w-10", // Future use
} as const;

export type AvatarSize = keyof typeof avatarSizes;

// Main avatar component props
export interface UserAvatarProps {
  owner: unknown;
  size?: AvatarSize;
  showName?: boolean;
  nameClassName?: string;
  containerClassName?: string;
  fallbackClassName?: string;
  fallback?: string;
}

// Reusable UserAvatar component
export const UserAvatar: React.FC<UserAvatarProps> = ({
  owner,
  size = "sm",
  showName = false,
  nameClassName = "",
  containerClassName = "",
  fallbackClassName = "",
  fallback = "—",
}) => {
  const ownerData = getOwnerData(owner);

  if (!ownerData) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }

  const { name, image } = ownerData;
  const initials = getInitials(name);

  const avatarElement = (
    <Avatar className={`${avatarSizes[size]} shrink-0`}>
      <AvatarImage src={image || undefined} alt={name} />
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );

  if (showName) {
    return (
      <div className={`flex items-center gap-2 ${containerClassName}`}>
        {avatarElement}
        <span className={nameClassName}>{name}</span>
      </div>
    );
  }

  return avatarElement;
};

// Specialized components for different use cases
export const KanbanAvatar: React.FC<{ owner: unknown }> = ({ owner }) => (
  <UserAvatar owner={owner} size="xs" fallback="" />
);

export const ListViewAvatar: React.FC<{ owner: unknown }> = ({ owner }) => (
  <UserAvatar owner={owner} size="sm" showName={true} nameClassName="" />
);

export const ItemSheetAvatar: React.FC<{ owner: unknown }> = ({ owner }) => (
  <UserAvatar
    owner={owner}
    size="md"
    showName={true}
    nameClassName="text-sm font-medium"
    containerClassName="gap-3"
    fallbackClassName="text-xs"
    fallback="No owner assigned"
  />
);

// Utility hook for getting owner display data
export const useOwnerDisplay = (owner: unknown) => {
  const ownerData = getOwnerData(owner);

  return {
    hasOwner: !!ownerData,
    name: ownerData?.name || "",
    image: ownerData?.image || "",
    initials: ownerData ? getInitials(ownerData.name) : "",
  };
};
