import { useState } from "react";
import { toast } from "sonner";
import { teamApi } from "@/api/team";
import type { User } from "@/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { parseErrorMessage } from "@/utils/errorParser";

interface MembersManagementProps {
  teamId: string;
  memberIds: string[];
  execMemberIds: string[];
  details: { members: User[]; code: string } | null;
  currentUserEmail?: string;
  selectedTeamExecMemberIds?: string[];
  onMemberPromoted: (memberId: string) => void;
  onMemberKicked: (memberId: string) => void;
  onConfirm: (options: {
    title: string;
    description: string;
    onConfirm: () => void;
  }) => void;
}

export function MembersManagement({
  teamId,
  memberIds,
  execMemberIds,
  details,
  currentUserEmail,
  selectedTeamExecMemberIds,
  onMemberPromoted,
  onMemberKicked,
  onConfirm,
}: MembersManagementProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberViewMode, setMemberViewMode] = useState<"cards" | "compact">(
    "cards"
  );
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [membersPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePromote = async (memberId: string) => {
    try {
      await teamApi.promoteMember(teamId, memberId);
      toast.success("Member promoted");
      onMemberPromoted(memberId);
    } catch (e) {
      const errorInfo = parseErrorMessage(e);
      toast.error(errorInfo.description);
    }
  };

  const handleKick = (memberId: string) => {
    onConfirm({
      title: "Remove member",
      description: "This member will be removed from the team.",
      onConfirm: async () => {
        try {
          await teamApi.kickMember(teamId, memberId);
          toast.success("Member removed from team");
          onMemberKicked(memberId);
        } catch (e) {
          const errorInfo = parseErrorMessage(e);
          toast.error(errorInfo.description);
        }
      },
    });
  };

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
  };

  const handleBulkPromote = () => {
    const currentUserMember = details?.members?.find(
      (member) => member.email === currentUserEmail
    );
    const currentUserId = currentUserMember?.id;
    const executiveMembers = execMemberIds || selectedTeamExecMemberIds || [];
    const isExecutive =
      currentUserId && executiveMembers.includes(currentUserId);

    if (!isExecutive) {
      toast.error("Only executives can promote members");
      return;
    }

    const memberEmails = selectedMembers
      .map((id) => details?.members?.find((m) => m.id === id)?.email || id)
      .join(", ");

    onConfirm({
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
      },
    });
  };

  const generateAvatarInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            Members ({memberIds.length})
            <div className="flex gap-2">
              <Badge
                variant="default"
                className="bg-primary text-primary-foreground"
              >
                {execMemberIds.length} Executive
                {execMemberIds.length !== 1 ? "s" : ""}
              </Badge>
              <Badge
                variant="outline"
                className="bg-muted text-muted-foreground"
              >
                {memberIds.length - execMemberIds.length} Member
                {memberIds.length - execMemberIds.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
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
                    setCurrentPage(1);
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
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => setMemberViewMode("cards")}
                >
                  Cards
                </button>
                <button
                  className={`px-3 py-1 rounded text-sm ${
                    memberViewMode === "compact"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => setMemberViewMode("compact")}
                >
                  List
                </button>
              </div>
            </div>

            {/* Member Count Info */}
            {memberSearchTerm && (
              <div className="text-sm text-muted-foreground">
                Found {getSortedMembers().length} of {details?.members?.length}{" "}
                members
              </div>
            )}

            {/* Member Display */}
            {memberViewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getPaginatedMembers().map((member) => {
                  const isExec = execMemberIds.includes(member.id);
                  const isSelected = selectedMembers.includes(member.id);
                  const currentUserMember = details?.members?.find(
                    (m) => m.email === currentUserEmail
                  );
                  const currentUserId = currentUserMember?.id;
                  const executiveMembers =
                    execMemberIds || selectedTeamExecMemberIds || [];
                  const isCurrentUserExecutive =
                    currentUserId && executiveMembers.includes(currentUserId);
                  const displayName =
                    member.first_name && member.last_name
                      ? `${member.first_name} ${member.last_name}`
                      : member.first_name || member.email.split("@")[0];

                  return (
                    <div
                      key={member.id}
                      className={`border rounded-lg p-4 transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : isExec
                          ? "border-primary/50 bg-card"
                          : "border-border hover:border-border/80"
                      }`}
                      onClick={() => handleMemberSelection(member.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                            isExec
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
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
                              <span className="text-primary text-xs">✓</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {isExec ? (
                              <Badge
                                variant="default"
                                className="bg-primary text-primary-foreground text-xs"
                              >
                                Executive
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-muted text-muted-foreground text-xs"
                              >
                                Member
                              </Badge>
                            )}
                            {member.email === currentUserEmail && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {member.email}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 ml-auto">
                          {!isExec &&
                            isCurrentUserExecutive &&
                            member.email !== currentUserEmail && (
                              <button
                                className="text-primary text-xs hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePromote(member.id);
                                }}
                              >
                                Promote
                              </button>
                            )}
                          {member.email !== currentUserEmail && (
                            <button
                              className="text-destructive text-xs hover:underline"
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
                    (m) => m.email === currentUserEmail
                  );
                  const currentUserId = currentUserMember?.id;
                  const executiveMembers =
                    execMemberIds || selectedTeamExecMemberIds || [];
                  const isCurrentUserExecutive =
                    currentUserId && executiveMembers.includes(currentUserId);
                  const displayName =
                    member.first_name && member.last_name
                      ? `${member.first_name} ${member.last_name}`
                      : member.first_name || member.email.split("@")[0];

                  return (
                    <div
                      key={member.id}
                      className={`border rounded p-3 transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : isExec
                          ? "border-primary/50 bg-card"
                          : "border-border hover:border-border/80"
                      }`}
                      onClick={() => handleMemberSelection(member.id)}
                    >
                      {/* Compact Avatar */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${
                          isExec
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {generateAvatarInitials(displayName)}
                      </div>

                      {/* Member Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{displayName}</h4>
                          {isExec ? (
                            <Badge
                              variant="default"
                              className="bg-primary text-primary-foreground text-xs"
                            >
                              Executive
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-muted text-muted-foreground text-xs"
                            >
                              Member
                            </Badge>
                          )}
                          {member.email === currentUserEmail && (
                            <Badge variant="secondary" className="text-xs">
                              You
                            </Badge>
                          )}
                          {isSelected && (
                            <span className="text-primary text-xs">✓</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </div>
                      </div>

                      {/* Compact Actions */}
                      <div className="flex items-center gap-2">
                        {!isExec &&
                          isCurrentUserExecutive &&
                          member.email !== currentUserEmail && (
                            <button
                              className="text-primary text-xs hover:underline px-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePromote(member.id);
                              }}
                            >
                              Promote
                            </button>
                          )}
                        {member.email !== currentUserEmail && (
                          <button
                            className="text-destructive text-xs hover:underline px-1"
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
                  className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {currentPage} of {getTotalPages()}
                </span>
                <button
                  className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span className="text-sm text-muted-foreground">
                  {selectedMembers.length} member
                  {selectedMembers.length > 1 ? "s" : ""} selected
                </span>
                <button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm hover:bg-primary/90"
                  onClick={handleBulkPromote}
                >
                  Promote Selected ({selectedMembers.length})
                </button>
                <button
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm hover:bg-secondary/80"
                  onClick={() => {
                    setSelectedMembers([]);
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
  );
}
