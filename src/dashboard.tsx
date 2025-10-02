import { QuickStats } from "./components/dashboard/quick-stats";
import { QuickNavigation } from "./components/dashboard/quick-navigation";
import { TeamSummary } from "./components/dashboard/team-summary";
import { UpcomingEvents } from "./components/dashboard/upcoming-events";
import { RecentActivity } from "./components/dashboard/recent-activity";
import { UserTasks } from "./components/dashboard/user-tasks";
import { useDashboardData } from "./hooks/useDashboardData";
import { Alert, AlertDescription } from "./components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";

export function Dashboard() {
  const { data, isLoading, error } = useDashboardData();
  const { selectedTeam } = useSelector((state: RootState) => state.teams);

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-left">
            Dashboard{selectedTeam ? ` - ${selectedTeam.name}` : ''}
          </h1>
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Quick Stats */}
          <section>
            <QuickStats
              upcomingEventsCount={data.upcomingEventsCount}
              completedEventsCount={data.completedEventsCount}
              activeProjectsCount={data.activeProjectsCount}
              totalTasksCompleted={data.totalTasksCompleted}
            />
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-2 space-y-8">
              {/* Navigation Cards */}
              <section>
                <QuickNavigation/>
              </section>

              {/* Upcoming Events */}
              <section>
                <UpcomingEvents
                  events={data.events}
                  isLoading={isLoading}
                />
              </section>

              {/* Recent Activity */}
              <section>
                <RecentActivity
                  activities={data.activities}
                  isLoading={isLoading}
                />
              </section>
            </div>

            {/* Right Column - Team Summary & User Tasks */}
            <div className="xl:col-span-1 space-y-8">
              <section>
                <UserTasks
                  userTasks={data.userTasks}
                  isLoading={isLoading}
                />
              </section>

              <section>
                <TeamSummary />
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
