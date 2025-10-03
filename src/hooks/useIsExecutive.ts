import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/redux";
import { authApi } from "@/api/auth";

export function useIsExecutive() {
  const [isExecutive, setIsExecutive] = useState<boolean | null>(null);
  const { selectedTeam } = useAppSelector((state) => state.teams);

  useEffect(() => {
    const checkExecutiveStatus = async () => {
      try {
        const user = await authApi.getCurrentUser();
        if (selectedTeam && user) {
          setIsExecutive(selectedTeam.exec_member_ids.includes(user.id));
        } else {
          setIsExecutive(false);
        }
      } catch (error) {
        console.error("Error checking executive status:", error);
        setIsExecutive(false);
      }
    };

    checkExecutiveStatus();
  }, [selectedTeam]);

  return isExecutive;
}
