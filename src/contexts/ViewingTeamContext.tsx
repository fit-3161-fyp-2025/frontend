import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface ViewingTeamContextType {
  viewingTeamId: string | null;
  isViewingTeamExecutive: boolean | null;
  setViewingTeam: (teamId: string | null, isExecutive: boolean | null) => void;
}

const ViewingTeamContext = createContext<ViewingTeamContextType | undefined>(
  undefined
);

export function ViewingTeamProvider({ children }: { children: ReactNode }) {
  const [viewingTeamId, setViewingTeamId] = useState<string | null>(null);
  const [isViewingTeamExecutive, setIsViewingTeamExecutive] = useState<
    boolean | null
  >(null);

  const setViewingTeam = (
    teamId: string | null,
    isExecutive: boolean | null
  ) => {
    setViewingTeamId(teamId);
    setIsViewingTeamExecutive(isExecutive);
  };

  return (
    <ViewingTeamContext.Provider
      value={{ viewingTeamId, isViewingTeamExecutive, setViewingTeam }}
    >
      {children}
    </ViewingTeamContext.Provider>
  );
}

export function useViewingTeam() {
  const context = useContext(ViewingTeamContext);
  if (context === undefined) {
    throw new Error("useViewingTeam must be used within ViewingTeamProvider");
  }
  return context;
}
