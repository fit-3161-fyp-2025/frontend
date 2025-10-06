import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageHeaderDisplay } from "@/contexts/PageHeaderContext";
import { Inbox } from "@/components/projects/inbox";
import { useIsExecutive } from "@/hooks/useIsExecutive";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks/redux";
import type { AppDispatch } from "@/lib/store";
import { reloadCurrentProject } from "@/features/teams/teamSlice";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router";

export function SiteHeader() {
  const isExecutive = useIsExecutive();
  const dispatch = useDispatch<AppDispatch>();
  const selectedProjectId = useAppSelector(
    (state) => state.teams.selectedProjectId
  );
  const location = useLocation();

  // Hide sidebar trigger on team details pages
  const shouldShowSidebarTrigger =
    !location.pathname.match(/^\/teams\/[^\/]+$/);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b pb-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {shouldShowSidebarTrigger && <SidebarTrigger className="-ml-2" />}
        {shouldShowSidebarTrigger && (
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-6"
          />
        )}
        <div className="text-base font-medium flex-1">
          <PageHeaderDisplay
            fallback={<h1 className="text-base font-black">Club Sync</h1>}
          />
        </div>
        <div className="flex items-center space-x-2">
          {isExecutive !== null && (
            <Badge
              variant={isExecutive ? "default" : "secondary"}
              className="text-xs"
            >
              {isExecutive ? "Exec" : "Member"}
            </Badge>
          )}
        </div>
        <div className="flex justify-end">
          <Inbox
            onApproved={(todoId?: string) => {
              if (selectedProjectId && todoId) {
                dispatch(reloadCurrentProject(todoId));
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
