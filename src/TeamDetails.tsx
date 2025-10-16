import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import { teamDetailsApi } from "@/api/teamDetails";
import type { User } from "@/types/auth";
import { projectsApi } from "@/api/projects";
import { teamApi } from "@/api/team";
import type { Project } from "@/types/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { parseErrorMessage } from "@/utils/errorParser";
import { DeleteTeamDialog } from "@/components/team/DeleteTeamDialog";
import { BudgetManagement } from "@/components/team-details/BudgetManagement";
import { MembersManagement } from "@/components/team-details/MembersManagement";
import { useAuth } from "@/contexts/AuthContext";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useViewingTeam } from "@/contexts/ViewingTeamContext";

export function TeamDetails() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { isFetchingTeams, selectedTeam } = useSelector(
    (state: RootState) => state.teams
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<{
    members: User[];
    code: string;
  } | null>(null);

  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [execMemberIds, setExecMemberIds] = useState<string[]>([]);
  const [teamProjectIds, setTeamProjectIds] = useState<string[]>([]);
  const [projectNamesById, setProjectNamesById] = useState<
    Record<string, string>
  >({});

  // Enhanced UI state - removed member-specific state (now in MembersManagement component)

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [project, setProject] = useState<Project | null>(null);
  const [_projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [projectsBudgetData, setProjectsBudgetData] = useState<
    Record<string, Project>
  >({});
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const { user, isLoading } = useAuth();
  const { confirm, DialogEl } = useConfirm();
  const { setHeader } = usePageHeader();
  const { setViewingTeam } = useViewingTeam();

  useEffect(() => {
    if (!teamId || !user) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Fetch the specific team by teamId from URL (not from Redux selectedTeam)
    // This ensures we always show the correct team data for the URL, independent of sidebar selection
    teamApi
      .getTeam(teamId)
      .then((teamRes) => {
        if (!isMounted) return;
        const team = teamRes.team;

        setMemberIds(team.member_ids || []);
        setExecMemberIds(team.exec_member_ids || []);
        const pids = team.project_ids || [];
        setTeamProjectIds(pids);

        // Update viewing team context for header badge
        const isExec = team.exec_member_ids.includes(user.id);
        setViewingTeam(teamId, isExec); // Set breadcrumb header
        setHeader(
          <div className="w-full">
            <div className="flex flex-col gap-1 py-1">
              <nav className="text-sm text-muted-foreground">
                <span
                  className="hover:text-foreground cursor-pointer"
                  onClick={() => navigate("/teams")}
                >
                  Manage Teams
                </span>
                <span className="mx-2">›</span>
                <span className="text-foreground">{team.name}</span>
              </nav>
            </div>
          </div>
        );

        // Fetch team details (members list)
        return teamDetailsApi.getDetails(teamId).then((detailsRes) => ({
          detailsRes,
          pids,
        }));
      })
      .then(async (result) => {
        if (!isMounted || !result) return;
        const { detailsRes, pids } = result;
        if (detailsRes) setDetails(detailsRes);

        // Fetch project names
        if (pids.length > 0) {
          setSelectedProjectId(pids[0]);
          const entries = await Promise.all(
            pids.map(async (pid: string) => {
              try {
                const projectRes = await projectsApi.getProject(pid);
                return [pid, projectRes.project.name] as const;
              } catch {
                return [pid, pid] as const;
              }
            })
          );
          if (isMounted) setProjectNamesById(Object.fromEntries(entries));
        }
      })
      .catch((e) => {
        const message = e instanceof Error ? e.message : String(e);
        console.error("Error loading team data:", message);
        if (isMounted) setError(message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
      // Clear viewing team context when leaving the page
      setViewingTeam(null, null);
    };
  }, [teamId, user]);

  useEffect(() => {
    if (!selectedProjectId) {
      setProject(null);
      return;
    }
    let isMounted = true;
    setProjectLoading(true);
    setProjectError(null);
    projectsApi
      .getProject(selectedProjectId)
      .then((res) => {
        if (isMounted) setProject(res.project);
      })
      .catch((e) => {
        const message = e instanceof Error ? e.message : String(e);
        if (isMounted) setProjectError(message);
      })
      .finally(() => {
        if (isMounted) setProjectLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedProjectId]);

  // Load budget data for all projects
  useEffect(() => {
    if (teamProjectIds.length === 0) {
      setProjectsBudgetData({});
      return;
    }

    let isMounted = true;
    const loadAllProjectBudgets = async () => {
      const promises = teamProjectIds.map(async (projectId) => {
        try {
          const res = await projectsApi.getProject(projectId);
          return [projectId, res.project] as const;
        } catch {
          return [projectId, null] as const;
        }
      });

      const results = await Promise.all(promises);
      if (isMounted) {
        const budgetData: Record<string, Project> = {};
        results.forEach(([projectId, projectData]) => {
          if (projectData) {
            budgetData[projectId] = projectData;
          }
        });
        setProjectsBudgetData(budgetData);
      }
    };

    loadAllProjectBudgets();

    return () => {
      isMounted = false;
    };
  }, [teamProjectIds]);

  const handleLeaveTeam = () => {
    if (!teamId) return;
    confirm({
      title: "Leave team",
      description: "You will no longer have access to this team.",
      onConfirm: async () => {
        setActionMsg(null);
        try {
          await teamApi.leave({ team_id: teamId });
          toast.success("You have left the team");
          navigate("/teams");
        } catch (e) {
          const errorInfo = parseErrorMessage(e);
          setActionMsg(`Failed to leave team: ${errorInfo.description}`);
          toast.error(errorInfo.description);
        }
      },
    });
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(details?.code ?? "");
      setActionMsg("Invite code copied");
      toast.success("Invite code copied");
    } catch {
      setActionMsg("Failed to copy invite code");
      toast.error("Failed to copy");
    }
  };

  const handleDeleteTeam = () => {
    navigate("/teams");
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!teamId) return;
    try {
      await teamApi.deleteProject(teamId, projectId);
      setTeamProjectIds((prev) => prev.filter((id) => id !== projectId));
      setProjectNamesById((prev) => {
        const newProjectNames = { ...prev };
        delete newProjectNames[projectId];
        return newProjectNames;
      });
      setProjectsBudgetData((prev) => {
        const newBudgetData = { ...prev };
        delete newBudgetData[projectId];
        return newBudgetData;
      });
      if (selectedProjectId === projectId) {
        const remainingProjects = teamProjectIds.filter(
          (id) => id !== projectId
        );
        setSelectedProjectId(
          remainingProjects.length > 0 ? remainingProjects[0] : null
        );
      }
      toast.success("Project has been permanently deleted");
    } catch (e) {
      const errorInfo = parseErrorMessage(e);
      toast.error(errorInfo.description);
    }
  };

  const handleCreateProject = async () => {
    if (!teamId) return;
    if (!newProjectName.trim()) {
      setActionMsg("Enter a project name");
      toast.error("Enter a project name");
      return;
    }
    if (!newProjectDesc.trim()) {
      setActionMsg("Enter a project description");
      toast.error("Enter a project description");
      return;
    }
    setCreatingProject(true);
    setActionMsg(null);
    try {
      const res = await projectsApi.createProject(
        teamId,
        newProjectName.trim(),
        newProjectDesc.trim()
      );
      const newId = res.project.id;
      setTeamProjectIds((prev) => [...prev, newId]);
      setProjectNamesById((prev) => ({ ...prev, [newId]: res.project.name }));
      setSelectedProjectId(newId);
      setNewProjectName("");
      setNewProjectDesc("");
      setShowCreateProject(false);
      setActionMsg("Project created");
      toast.success(res.project.name);
    } catch (e) {
      const errorInfo = parseErrorMessage(e);
      setActionMsg(`Failed to create project: ${errorInfo.description}`);
      toast.error(errorInfo.description);
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {DialogEl}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {selectedTeam?.name ||
            (isFetchingTeams ? "Loading team..." : `Team ${teamId}`)}
        </h1>
        <div className="flex gap-4">
          {selectedTeam && user && !isLoading && (
            <DeleteTeamDialog
              team={selectedTeam}
              onDelete={handleDeleteTeam}
              execMemberIds={execMemberIds}
              memberDetails={details?.members}
            />
          )}
          <Button variant="destructive" size="sm" onClick={handleLeaveTeam}>
            Leave team
          </Button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}
      {error && (
        <p className="text-destructive">Failed to load details: {error}</p>
      )}

      {!loading && !error && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                Invite Code
                <Button variant="ghost" size="sm" onClick={handleCopyInvite}>
                  Copy
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {details ? (
                <code className="px-2 py-1 bg-muted rounded">
                  {details.code}
                </code>
              ) : (
                <Skeleton className="h-6 w-40" />
              )}
            </CardContent>
          </Card>

          <MembersManagement
            teamId={teamId!}
            memberIds={memberIds}
            execMemberIds={execMemberIds}
            details={details}
            currentUserEmail={user?.email}
            onMemberPromoted={(memberId) => {
              setExecMemberIds((prev) =>
                prev.includes(memberId) ? prev : [...prev, memberId]
              );
            }}
            onMemberKicked={(memberId) => {
              setMemberIds((prev) => prev.filter((id) => id !== memberId));
              setExecMemberIds((prev) => prev.filter((id) => id !== memberId));
            }}
            onConfirm={confirm}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  Projects Management
                  <Badge
                    variant="secondary"
                    className="bg-secondary text-secondary-foreground"
                  >
                    {teamProjectIds.length} project
                    {teamProjectIds.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <Button
                  variant={showCreateProject ? "secondary" : "default"}
                  size="sm"
                  onClick={() => {
                    setShowCreateProject(!showCreateProject);
                    if (!showCreateProject) {
                      setNewProjectName("");
                      setNewProjectDesc("");
                    }
                  }}
                >
                  {showCreateProject ? "Cancel" : "+ New Project"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamProjectIds.length === 0 ? (
                /* Empty State */
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-2xl">📁</span>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No Projects Yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first project to start managing budgets and
                    tracking progress.
                  </p>
                  <div className="flex flex-col gap-3 max-w-md mx-auto">
                    <input
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Project name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                    <textarea
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring focus:border-transparent h-20 resize-none"
                      placeholder="Project description"
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                    />
                    <Button
                      disabled={
                        creatingProject ||
                        !newProjectName.trim() ||
                        !newProjectDesc.trim()
                      }
                      onClick={handleCreateProject}
                    >
                      {creatingProject ? "Creating..." : "Create Project"}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Projects Overview */
                <>
                  {/* Project Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamProjectIds.map((projectId) => {
                      const projectName =
                        projectNamesById[projectId] || projectId;
                      const isSelected = selectedProjectId === projectId;
                      const currentUserMember = details?.members?.find(
                        (member) => member.email === user?.email
                      );
                      const currentUserId = currentUserMember?.id;
                      const executiveMembers =
                        execMemberIds || selectedTeam?.exec_member_ids || [];
                      const isExecutive =
                        currentUserId &&
                        executiveMembers.includes(currentUserId);

                      return (
                        <div
                          key={projectId}
                          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border hover:border-border/80"
                          }`}
                          onClick={() => setSelectedProjectId(projectId)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {projectName}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Project ID: {projectId.slice(-6)}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-primary text-sm">✓</span>
                            )}
                          </div>

                          {/* Budget Overview */}
                          {projectsBudgetData[projectId] ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Budget:
                                </span>
                                <span className="font-medium">
                                  $
                                  {(
                                    projectsBudgetData[projectId]
                                      .budget_available +
                                    projectsBudgetData[projectId].budget_spent
                                  ).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Available:
                                </span>
                                <span className="text-green-600 font-medium">
                                  $
                                  {projectsBudgetData[
                                    projectId
                                  ].budget_available.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Spent:
                                </span>
                                <span className="text-red-600 font-medium">
                                  $
                                  {projectsBudgetData[
                                    projectId
                                  ].budget_spent.toFixed(2)}
                                </span>
                              </div>

                              {/* Budget Progress Bar */}
                              <div className="mt-2">
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-destructive h-2 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (() => {
                                          const totalBudget =
                                            projectsBudgetData[projectId]
                                              .budget_available +
                                            projectsBudgetData[projectId]
                                              .budget_spent;
                                          return totalBudget > 0
                                            ? (projectsBudgetData[projectId]
                                                .budget_spent /
                                                totalBudget) *
                                                100
                                            : 0;
                                        })()
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {(() => {
                                    const totalBudget =
                                      projectsBudgetData[projectId]
                                        .budget_available +
                                      projectsBudgetData[projectId]
                                        .budget_spent;
                                    return totalBudget > 0
                                      ? (
                                          (projectsBudgetData[projectId]
                                            .budget_spent /
                                            totalBudget) *
                                          100
                                        ).toFixed(1)
                                      : "0.0";
                                  })()}
                                  % spent
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Status:
                                </span>
                                <span className="text-muted-foreground">
                                  Loading...
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          {isExecutive && (
                            <div className="flex gap-2 mt-3 pt-3 border-t">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const projectName =
                                    projectNamesById[projectId] || projectId;
                                  confirm({
                                    title: "Delete Project",
                                    description: `Are you sure you want to permanently delete "${projectName}"? This action cannot be undone and will delete all associated data.`,
                                    onConfirm: () =>
                                      handleDeleteProject(projectId),
                                  });
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Create Project Form */}
                  {showCreateProject && (
                    <div className="border bg-muted/50 rounded-lg p-4 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-foreground">
                          Create New Project
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCreateProject(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                      <div className="flex flex-col gap-3">
                        <input
                          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring focus:border-transparent"
                          placeholder="Project name"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                        />
                        <textarea
                          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring focus:border-transparent h-20 resize-none"
                          placeholder="Project description"
                          value={newProjectDesc}
                          onChange={(e) => setNewProjectDesc(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            disabled={
                              creatingProject ||
                              !newProjectName.trim() ||
                              !newProjectDesc.trim()
                            }
                            onClick={handleCreateProject}
                          >
                            {creatingProject ? "Creating..." : "Create Project"}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => setShowCreateProject(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Budget Management Section */}
                  {selectedProjectId && project && !projectError && (
                    <BudgetManagement
                      selectedProjectId={selectedProjectId}
                      projectName={projectNamesById[selectedProjectId]}
                      project={project}
                      onBudgetUpdate={(updatedProject) => {
                        setProject(updatedProject);
                        setProjectsBudgetData((prev) => ({
                          ...prev,
                          [selectedProjectId]: updatedProject,
                        }));
                      }}
                    />
                  )}

                  {/* Show budget error */}
                  {projectError && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-4">
                      <p className="text-destructive text-sm">
                        Error: {projectError}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Event Management Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    We're working on bringing you comprehensive event management
                    features.
                  </p>
                  <div className="mt-4">
                    <Badge variant="secondary" className="text-sm">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {actionMsg && (
            <p className="text-sm text-muted-foreground">{actionMsg}</p>
          )}
        </>
      )}
    </div>
  );
}
