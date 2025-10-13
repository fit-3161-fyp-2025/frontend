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

import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { parseErrorMessage } from "@/utils/errorParser";
import { DeleteTeamDialog } from "@/components/team/DeleteTeamDialog";
import { useAuth } from "@/contexts/AuthContext";
// import { MockDataToggle } from "@/components/MockDataToggle";
import { usePageHeader } from "@/contexts/PageHeaderContext";

export function TeamDetails() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { teams, isFetchingTeams } = useSelector(
    (state: RootState) => state.teams
  );
  const team = teams.find((t) => t.id === teamId);

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

  // Enhanced UI state
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberViewMode, setMemberViewMode] = useState<"cards" | "compact">(
    "cards"
  );
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [membersPerPage] = useState(12); // Show 12 members per page
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [project, setProject] = useState<Project | null>(null);
  const [_projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [projectsBudgetData, setProjectsBudgetData] = useState<
    Record<string, Project>
  >({});
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Event management state
  const [_showBulkActions, setShowBulkActions] = useState(false);

  const { user, isLoading } = useAuth();
  const { confirm, DialogEl } = useConfirm();
  const { push } = useToast();
  const { setHeader } = usePageHeader();

  useEffect(() => {
    if (!teamId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Force refresh when mock data toggle changes
    const forceRefresh = localStorage.getItem("showMockData") === "true";
    console.log(
      "Loading team data (mock enabled:",
      forceRefresh,
      "for teamId:",
      teamId
    );

    Promise.all([teamDetailsApi.getDetails(teamId), teamApi.getTeam(teamId)])
      .then(async ([res, teamRes]) => {
        if (!isMounted) return;
        setDetails(res);
        setMemberIds(teamRes.team.member_ids || []);
        setExecMemberIds(teamRes.team.exec_member_ids || []);
        const pids = teamRes.team.project_ids || [];
        setTeamProjectIds(pids);

        // Set breadcrumb header
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
                <span className="text-foreground">{teamRes.team.name}</span>
              </nav>
            </div>
          </div>
        );

        if (pids.length > 0) {
          setSelectedProjectId(pids[0]);
          const entries = await Promise.all(
            pids.map(async (pid) => {
              try {
                const res = await projectsApi.getProject(pid);
                return [pid, res.project.name] as const;
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
    };
  }, [teamId]);

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

  const handlePromote = async (memberId: string) => {
    if (!teamId) return;
    setActionMsg(null);
    try {
      await teamApi.promoteMember(teamId, memberId);
      setActionMsg("Member promoted");
      push({
        title: "Success",
        description: "Member promoted",
        variant: "success",
      });
      setExecMemberIds((prev) =>
        prev.includes(memberId) ? prev : [...prev, memberId]
      );
    } catch (e) {
      const errorInfo = parseErrorMessage(e);
      setActionMsg(`Failed to promote: ${errorInfo.description}`);
      push({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive",
      });
    }
  };

  const handleKick = (memberId: string) => {
    if (!teamId) return;
    confirm({
      title: "Remove member",
      description: "This member will be removed from the team.",
      onConfirm: async () => {
        setActionMsg(null);
        try {
          await teamApi.kickMember(teamId, memberId);
          setMemberIds((prev) => prev.filter((id) => id !== memberId));
          setExecMemberIds((prev) => prev.filter((id) => id !== memberId));
          setActionMsg("Member removed");
          push({
            title: "Removed",
            description: "Member removed from team",
            variant: "success",
          });
        } catch (e) {
          const errorInfo = parseErrorMessage(e);
          setActionMsg(`Failed to remove member: ${errorInfo.description}`);
          push({
            title: errorInfo.title,
            description: errorInfo.description,
            variant: "destructive",
          });
        }
      },
    });
  };

  const handleLeaveTeam = () => {
    if (!teamId) return;
    confirm({
      title: "Leave team",
      description: "You will no longer have access to this team.",
      onConfirm: async () => {
        setActionMsg(null);
        try {
          await teamApi.leave({ team_id: teamId });
          push({
            title: "Left team",
            description: "You have left the team",
            variant: "success",
          });
          navigate("/teams");
        } catch (e) {
          const errorInfo = parseErrorMessage(e);
          setActionMsg(`Failed to leave team: ${errorInfo.description}`);
          push({
            title: errorInfo.title,
            description: errorInfo.description,
            variant: "destructive",
          });
        }
      },
    });
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(details?.code ?? "");
      setActionMsg("Invite code copied");
      push({ title: "Copied", description: "Invite code copied" });
    } catch {
      setActionMsg("Failed to copy invite code");
      push({
        title: "Error",
        description: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTeam = () => {
    navigate("/teams");
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!teamId) return;
    setActionMsg(null);
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
      setActionMsg("Project deleted");
      push({
        title: "Project Deleted",
        description: "Project has been permanently deleted",
        variant: "default",
      });
    } catch (e) {
      const errorInfo = parseErrorMessage(e);
      setActionMsg(`Failed to delete project: ${errorInfo.description}`);
      push({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive",
      });
    }
  };

  const handleIncreaseBudget = async () => {
    if (!selectedProjectId) return;
    const amount = parseFloat(budgetAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionMsg("Enter a positive amount");
      push({
        title: "Invalid amount",
        description: "Enter a positive number",
        variant: "destructive",
      });
      return;
    }
    setActionMsg(null);
    try {
      await projectsApi.increaseBudget(selectedProjectId, amount);
      const res = await projectsApi.getProject(selectedProjectId);
      setProject(res.project);
      setProjectsBudgetData((prev) => ({
        ...prev,
        [selectedProjectId]: res.project,
      }));
      setBudgetAmount("");
      setActionMsg("Budget increased");
      push({
        title: "Budget updated",
        description: "Amount added",
        variant: "success",
      });
    } catch (e) {
      const errorInfo = parseErrorMessage(e);
      setActionMsg(`Failed to increase budget: ${errorInfo.description}`);
      push({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive",
      });
    }
  };

  const handleSpendBudget = async () => {
    if (!selectedProjectId) return;
    const amount = parseFloat(budgetAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionMsg("Enter a positive amount");
      push({
        title: "Invalid amount",
        description: "Enter a positive number",
        variant: "destructive",
      });
      return;
    }
    setActionMsg(null);
    try {
      await projectsApi.spendBudget(selectedProjectId, amount);
      const res = await projectsApi.getProject(selectedProjectId);
      setProject(res.project);
      setProjectsBudgetData((prev) => ({
        ...prev,
        [selectedProjectId]: res.project,
      }));
      setBudgetAmount("");
      setActionMsg("Budget spent");
      push({
        title: "Budget updated",
        description: "Amount spent",
        variant: "success",
      });
    } catch (e) {
      const errorInfo = parseErrorMessage(e);
      setActionMsg(`Failed to spend budget: ${errorInfo.description}`);
      push({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive",
      });
    }
  };

  // Enhanced member management helpers
  const getSortedMembers = () => {
    if (!details?.members) return [];

    let members = [...details.members];

    // Filter by search term
    if (memberSearchTerm.trim()) {
      members = members.filter((member) => {
        const displayName =
          member.first_name && member.last_name
            ? `${member.first_name} ${member.last_name}`
            : member.first_name || member.email.split("@")[0];
        return (
          member.email.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
          displayName.toLowerCase().includes(memberSearchTerm.toLowerCase())
        );
      });
    }

    // Sort members by role first, then by name
    members.sort((a, b) => {
      const aIsExec = execMemberIds.includes(a.id);
      const bIsExec = execMemberIds.includes(b.id);

      // Executives first
      if (aIsExec && !bIsExec) return -1;
      if (!aIsExec && bIsExec) return 1;

      // Then sort by name
      const aName =
        a.first_name && a.last_name
          ? `${a.first_name} ${a.last_name}`
          : a.first_name || a.email.split("@")[0];
      const bName =
        b.first_name && b.last_name
          ? `${b.first_name} ${b.last_name}`
          : b.first_name || b.email.split("@")[0];
      return aName.localeCompare(bName);
    });

    return members;
  };

  const getPaginatedMembers = () => {
    const allMembers = getSortedMembers();
    const startIndex = (currentPage - 1) * membersPerPage;
    const endIndex = startIndex + membersPerPage;
    return allMembers.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const totalMembers = getSortedMembers().length;
    return Math.ceil(totalMembers / membersPerPage);
  };

  const handleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
    setShowBulkActions(selectedMembers.length > 0);
  };

  const handleBulkPromote = () => {
    const currentUserMember = details?.members?.find(
      (member) => member.email === user?.email
    );
    const currentUserId = currentUserMember?.id;
    const executiveMembers = execMemberIds || team?.exec_member_ids || [];
    const isExecutive =
      currentUserId && executiveMembers.includes(currentUserId);

    if (!isExecutive) {
      push({
        title: "Permission Denied",
        description: "Only executives can promote members",
        variant: "destructive",
      });
      return;
    }

    const memberEmails = selectedMembers
      .map((id) => details?.members?.find((m) => m.id === id)?.email || id)
      .join(", ");

    confirm({
      title: "Promote Members",
      description: `Are you sure you want to promote ${
        selectedMembers.length
      } member${
        selectedMembers.length > 1 ? "s" : ""
      } to executive? This will give them full team management permissions.\n\nMembers: ${memberEmails}`,
      onConfirm: () => {
        selectedMembers.forEach((memberId) => {
          handlePromote(memberId);
        });
        setSelectedMembers([]);
        setShowBulkActions(false);
      },
    });
  };

  const generateAvatarInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleCreateProject = async () => {
    if (!teamId) return;
    if (!newProjectName.trim()) {
      setActionMsg("Enter a project name");
      push({
        title: "Missing name",
        description: "Enter a project name",
        variant: "destructive",
      });
      return;
    }
    setCreatingProject(true);
    setActionMsg(null);
    try {
      const res = await projectsApi.createProject(
        teamId,
        newProjectName.trim(),
        newProjectDesc.trim() || undefined
      );
      const newId = res.project.id;
      setTeamProjectIds((prev) => [...prev, newId]);
      setProjectNamesById((prev) => ({ ...prev, [newId]: res.project.name }));
      setSelectedProjectId(newId);
      setNewProjectName("");
      setNewProjectDesc("");
      setShowCreateProject(false);
      setActionMsg("Project created");
      push({
        title: "Project created",
        description: res.project.name,
        variant: "success",
      });
    } catch (e) {
      const errorInfo = parseErrorMessage(e);
      setActionMsg(`Failed to create project: ${errorInfo.description}`);
      push({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive",
      });
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Mock Data Toggle */}
      {/* <MockDataToggle /> */}

      {DialogEl}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {team?.name ||
            (isFetchingTeams ? "Loading team..." : `Team ${teamId}`)}
        </h1>
        <div className="flex gap-4">
          {team && user && !isLoading && (
            <DeleteTeamDialog
              team={team}
              onDelete={handleDeleteTeam}
              execMemberIds={execMemberIds}
              memberDetails={details?.members}
            />
          )}
          <button
            className="text-sm text-red-600 hover:underline"
            onClick={handleLeaveTeam}
          >
            Leave team
          </button>
        </div>
      </div>
      <p className="text-gray-600">Team ID: {teamId}</p>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}
      {error && <p className="text-red-600">Failed to load details: {error}</p>}

      {!loading && !error && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                Invite Code
                <button
                  className="text-sm text-purple-600 hover:underline"
                  onClick={handleCopyInvite}
                >
                  Copy
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {details ? (
                <code className="px-2 py-1 bg-gray-100 rounded">
                  {details.code}
                </code>
              ) : (
                <Skeleton className="h-6 w-40" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  Members ({memberIds.length})
                  <div className="flex gap-2">
                    <Badge
                      variant="default"
                      className="bg-purple-100 text-purple-700"
                    >
                      {execMemberIds.length} Executive
                      {execMemberIds.length !== 1 ? "s" : ""}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-700"
                    >
                      {memberIds.length - execMemberIds.length} Member
                      {memberIds.length - execMemberIds.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
                {team?.short_id && (
                  <div className="bg-gray-200 rounded px-2 py-1">
                    <code>#{team.short_id}</code>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!details?.members ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search members by name or email..."
                        className="border rounded px-3 py-2 w-full"
                        value={memberSearchTerm}
                        onChange={(e) => {
                          setMemberSearchTerm(e.target.value);
                          setCurrentPage(1); // Reset to first page on search
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <label className="text-sm font-medium flex items-center">
                        View:
                      </label>
                      <button
                        className={`px-3 py-1 rounded text-sm ${
                          memberViewMode === "cards"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => setMemberViewMode("cards")}
                      >
                        Cards
                      </button>
                      <button
                        className={`px-3 py-1 rounded text-sm ${
                          memberViewMode === "compact"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => setMemberViewMode("compact")}
                      >
                        List
                      </button>
                    </div>
                  </div>

                  {/* Member Count Info */}
                  {memberSearchTerm && (
                    <div className="text-sm text-gray-600">
                      Found {getSortedMembers().length} of{" "}
                      {details?.members?.length} members
                    </div>
                  )}

                  {/* Member Display */}
                  {memberViewMode === "cards" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {getPaginatedMembers().map((member) => {
                        const isExec = execMemberIds.includes(member.id);
                        const isSelected = selectedMembers.includes(member.id);
                        const currentUserMember = details?.members?.find(
                          (m) => m.email === user?.email
                        );
                        const currentUserId = currentUserMember?.id;
                        const executiveMembers =
                          execMemberIds || team?.exec_member_ids || [];
                        const isCurrentUserExecutive =
                          currentUserId &&
                          executiveMembers.includes(currentUserId);
                        const displayName =
                          member.first_name && member.last_name
                            ? `${member.first_name} ${member.last_name}`
                            : member.first_name || member.email.split("@")[0];

                        return (
                          <div
                            key={member.id}
                            className={`border rounded-lg p-4 transition-all cursor-pointer ${
                              isSelected
                                ? "border-purple-500 bg-purple-50"
                                : isExec
                                ? "border-purple-300 bg-white"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleMemberSelection(member.id)}
                          >
                            <div className="flex items-start gap-3">
                              {/* Avatar */}
                              <div
                                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                                  isExec
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-400 text-white"
                                }`}
                              >
                                {generateAvatarInitials(displayName)}
                              </div>

                              {/* Member Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm truncate">
                                    {displayName}
                                  </h4>
                                  {isSelected && (
                                    <span className="text-purple-600 text-xs">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {isExec ? (
                                    <Badge
                                      variant="default"
                                      className="bg-purple-100 text-purple-700 text-xs"
                                    >
                                      Executive
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="bg-gray-100 text-gray-700 text-xs"
                                    >
                                      Member
                                    </Badge>
                                  )}
                                  {member.email === user?.email && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 truncate">
                                  {member.email}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-1 ml-auto">
                                {!isExec &&
                                  isCurrentUserExecutive &&
                                  member.email !== user?.email && (
                                    <button
                                      className="text-purple-600 text-xs hover:underline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePromote(member.id);
                                      }}
                                    >
                                      Promote
                                    </button>
                                  )}
                                {member.email !== user?.email && (
                                  <button
                                    className="text-red-600 text-xs hover:underline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleKick(member.id);
                                    }}
                                  >
                                    Kick
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Compact List View */
                    <div className="space-y-1">
                      {getPaginatedMembers().map((member) => {
                        const isExec = execMemberIds.includes(member.id);
                        const isSelected = selectedMembers.includes(member.id);
                        const currentUserMember = details?.members?.find(
                          (m) => m.email === user?.email
                        );
                        const currentUserId = currentUserMember?.id;
                        const executiveMembers =
                          execMemberIds || team?.exec_member_ids || [];
                        const isCurrentUserExecutive =
                          currentUserId &&
                          executiveMembers.includes(currentUserId);
                        const displayName =
                          member.first_name && member.last_name
                            ? `${member.first_name} ${member.last_name}`
                            : member.first_name || member.email.split("@")[0];

                        return (
                          <div
                            key={member.id}
                            className={`border rounded p-3 transition-all cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? "border-purple-500 bg-purple-50"
                                : isExec
                                ? "border-purple-200 bg-purple-25"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleMemberSelection(member.id)}
                          >
                            {/* Compact Avatar */}
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${
                                isExec
                                  ? "bg-purple-600 text-white"
                                  : "bg-gray-400 text-white"
                              }`}
                            >
                              {generateAvatarInitials(displayName)}
                            </div>

                            {/* Member Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">
                                  {displayName}
                                </h4>
                                {isExec ? (
                                  <Badge
                                    variant="default"
                                    className="bg-purple-100 text-purple-700 text-xs"
                                  >
                                    Executive
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-gray-100 text-gray-700 text-xs"
                                  >
                                    Member
                                  </Badge>
                                )}
                                {member.email === user?.email && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    You
                                  </Badge>
                                )}
                                {isSelected && (
                                  <span className="text-purple-600 text-xs">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {member.email}
                              </div>
                            </div>

                            {/* Compact Actions */}
                            <div className="flex items-center gap-2">
                              {!isExec &&
                                isCurrentUserExecutive &&
                                member.email !== user?.email && (
                                  <button
                                    className="text-purple-600 text-xs hover:underline px-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePromote(member.id);
                                    }}
                                  >
                                    Promote
                                  </button>
                                )}
                              {member.email !== user?.email && (
                                <button
                                  className="text-red-600 text-xs hover:underline px-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleKick(member.id);
                                  }}
                                >
                                  Kick
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {getTotalPages() > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4 border-t">
                      <button
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        ← Previous
                      </button>
                      <span className="text-sm text-gray-600 px-3">
                        Page {currentPage} of {getTotalPages()}
                      </span>
                      <button
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(getTotalPages(), prev + 1)
                          )
                        }
                        disabled={currentPage === getTotalPages()}
                      >
                        Next →
                      </button>
                    </div>
                  )}

                  {/* Bulk Actions */}
                  {selectedMembers.length > 0 && (
                    <div className="flex items-center justify-center gap-3 border-t pt-4">
                      <span className="text-sm text-gray-600">
                        {selectedMembers.length} member
                        {selectedMembers.length > 1 ? "s" : ""} selected
                      </span>
                      <button
                        className="bg-purple-600 text-white px-4 py-2 rounded text-sm"
                        onClick={handleBulkPromote}
                      >
                        Promote Selected ({selectedMembers.length})
                      </button>
                      <button
                        className="bg-gray-500 text-white px-4 py-2 rounded text-sm"
                        onClick={() => {
                          setSelectedMembers([]);
                          setShowBulkActions(false);
                        }}
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  Projects Management
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700"
                  >
                    {teamProjectIds.length} project
                    {teamProjectIds.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <button
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                  onClick={() => {
                    setShowCreateProject(!showCreateProject);
                    if (!showCreateProject) {
                      setNewProjectName("");
                      setNewProjectDesc("");
                    }
                  }}
                >
                  {showCreateProject ? "Cancel" : "+ New Project"}
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamProjectIds.length === 0 ? (
                /* Empty State */
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📁</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Projects Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first project to start managing budgets and
                    tracking progress.
                  </p>
                  <div className="flex flex-col gap-3 max-w-md mx-auto">
                    <input
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Project name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                    <textarea
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20 resize-none"
                      placeholder="Description (optional)"
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                    />
                    <button
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={creatingProject || !newProjectName.trim()}
                      onClick={handleCreateProject}
                    >
                      {creatingProject ? "Creating..." : "Create Project"}
                    </button>
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
                        execMemberIds || team?.exec_member_ids || [];
                      const isExecutive =
                        currentUserId &&
                        executiveMembers.includes(currentUserId);

                      return (
                        <div
                          key={projectId}
                          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            isSelected
                              ? "border-purple-500 bg-purple-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedProjectId(projectId)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {projectName}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                Project ID: {projectId.slice(-6)}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-purple-600 text-sm">✓</span>
                            )}
                          </div>

                          {/* Budget Overview */}
                          {projectsBudgetData[projectId] ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Budget:</span>
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
                                <span className="text-gray-600">
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
                                <span className="text-gray-600">Spent:</span>
                                <span className="text-red-600 font-medium">
                                  $
                                  {projectsBudgetData[
                                    projectId
                                  ].budget_spent.toFixed(2)}
                                </span>
                              </div>

                              {/* Budget Progress Bar */}
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-red-500 h-2 rounded-full"
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
                                <p className="text-xs text-gray-600 mt-1">
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
                                <span className="text-gray-600">Status:</span>
                                <span className="text-gray-500">
                                  Loading...
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 mt-3 pt-3 border-t">
                            {isExecutive && (
                              <button
                                className="flex-1 bg-red-50 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-100"
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
                              </button>
                            )}
                            {!isExecutive && isSelected && (
                              <button
                                className="flex-1 bg-red-50 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  push({
                                    title: "Permission Denied",
                                    description:
                                      "Only executives can delete projects",
                                    variant: "destructive",
                                  });
                                }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Create Project Form */}
                  {showCreateProject && (
                    <div className="border bg-purple-50 rounded-lg p-4 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-purple-800">
                          Create New Project
                        </h4>
                        <button
                          className="text-purple-600 hover:text-purple-800 text-sm"
                          onClick={() => setShowCreateProject(false)}
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="flex flex-col gap-3">
                        <input
                          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Project name"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                        />
                        <textarea
                          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20 resize-none"
                          placeholder="Description (optional)"
                          value={newProjectDesc}
                          onChange={(e) => setNewProjectDesc(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={creatingProject || !newProjectName.trim()}
                            onClick={handleCreateProject}
                          >
                            {creatingProject ? "Creating..." : "Create Project"}
                          </button>
                          <button
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            onClick={() => setShowCreateProject(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Budget Management Section */}
                  {selectedProjectId && project && !projectError && (
                    <div className="border-t pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-lg text-gray-800">
                          {projectNamesById[selectedProjectId]} Budget
                          Management
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Total:</span>
                          <span className="font-bold text-lg">
                            $
                            {(
                              project.budget_available + project.budget_spent
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Budget Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Available Budget */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-medium text-green-800">
                                Available Budget
                              </h5>
                              <p className="text-2xl font-bold text-green-600">
                                ${project.budget_available.toFixed(2)}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-bold">
                                ✓
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Spent Budget */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-medium text-red-800">
                                Budget Spent
                              </h5>
                              <p className="text-2xl font-bold text-red-600">
                                ${project.budget_spent.toFixed(2)}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 font-bold">$</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Budget Actions */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-3">
                          Budget Actions
                        </h5>
                        <p className="text-sm text-gray-600 mb-3">
                          {actionMsg ||
                            "Enter an amount below to add or spend budget"}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="border rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Amount"
                            value={budgetAmount}
                            onChange={(e) => setBudgetAmount(e.target.value)}
                          />
                          <button
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={
                              !budgetAmount || parseFloat(budgetAmount) <= 0
                            }
                            onClick={handleIncreaseBudget}
                          >
                            + Add Budget
                          </button>
                          <button
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={
                              !budgetAmount ||
                              parseFloat(budgetAmount) <= 0 ||
                              parseFloat(budgetAmount) >
                                project.budget_available
                            }
                            onClick={handleSpendBudget}
                          >
                            - Spend Budget
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show budget error */}
                  {projectError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                      <p className="text-red-700 text-sm">
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Event Management Coming Soon
                  </h3>
                  <p className="text-gray-600">
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

          {actionMsg && <p className="text-sm text-gray-700">{actionMsg}</p>}
        </>
      )}
    </div>
  );
}
