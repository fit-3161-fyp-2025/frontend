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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TeamDetails() {
	const navigate = useNavigate();
	const { teamId } = useParams();
	const { teams, isFetchingTeams } = useSelector((state: RootState) => state.teams);
	const team = teams.find(t => t.id === teamId);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [details, setDetails] = useState<{ members: User[]; code: string } | null>(null);

	const [memberIds, setMemberIds] = useState<string[]>([]);
	const [execMemberIds, setExecMemberIds] = useState<string[]>([]);
	const [teamProjectIds, setTeamProjectIds] = useState<string[]>([]);
	const [projectNamesById, setProjectNamesById] = useState<Record<string, string>>({});

	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
	const [project, setProject] = useState<Project | null>(null);
	const [projectLoading, setProjectLoading] = useState(false);
	const [projectError, setProjectError] = useState<string | null>(null);
	const [budgetAmount, setBudgetAmount] = useState<string>("");
	const [actionMsg, setActionMsg] = useState<string | null>(null);

	const [newProjectName, setNewProjectName] = useState("");
	const [newProjectDesc, setNewProjectDesc] = useState("");
	const [creatingProject, setCreatingProject] = useState(false);

	useEffect(() => {
		if (!teamId) return;
		let isMounted = true;
		setLoading(true);
		setError(null);
		Promise.all([
			teamDetailsApi.getDetails(teamId),
			projectsApi.getTeam(teamId),
		])
			.then(async ([res, teamRes]) => {
				if (!isMounted) return;
				setDetails(res);
				setMemberIds(teamRes.team.member_ids || []);
				setExecMemberIds(teamRes.team.exec_member_ids || []);
				const pids = teamRes.team.project_ids || [];
				setTeamProjectIds(pids);
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
			.catch(e => {
				const message = e instanceof Error ? e.message : String(e);
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
		projectsApi.getProject(selectedProjectId)
			.then(res => {
				if (isMounted) setProject(res.project);
			})
			.catch(e => {
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

	const handlePromote = async (memberId: string) => {
		if (!teamId) return;
		setActionMsg(null);
		try {
			await teamApi.promoteMember(teamId, memberId);
			setActionMsg("Member promoted");
			setExecMemberIds(prev => prev.includes(memberId) ? prev : [...prev, memberId]);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			setActionMsg(`Failed to promote: ${message}`);
		}
	};

	const handleKick = async (memberId: string) => {
		if (!teamId) return;
		if (!confirm("Remove this member from the team?")) return;
		setActionMsg(null);
		try {
			await teamApi.kickMember(teamId, memberId);
			setMemberIds(prev => prev.filter(id => id !== memberId));
			setExecMemberIds(prev => prev.filter(id => id !== memberId));
			setActionMsg("Member removed");
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			setActionMsg(`Failed to remove member: ${message}`);
		}
	};

	const handleLeaveTeam = async () => {
		if (!teamId) return;
		if (!confirm("Leave this team?")) return;
		setActionMsg(null);
		try {
			await teamApi.leave({ team_id: teamId });
			navigate("/teams");
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			setActionMsg(`Failed to leave team: ${message}`);
		}
	};

	const handleCopyInvite = async () => {
		try {
			await navigator.clipboard.writeText(details?.code ?? "");
			setActionMsg("Invite code copied");
		} catch {
			setActionMsg("Failed to copy invite code");
		}
	};

	const handleIncreaseBudget = async () => {
		if (!selectedProjectId) return;
		const amount = parseFloat(budgetAmount);
		if (!Number.isFinite(amount) || amount <= 0) {
			setActionMsg("Enter a positive amount");
			return;
		}
		setActionMsg(null);
		try {
			await projectsApi.increaseBudget(selectedProjectId, amount);
			const res = await projectsApi.getProject(selectedProjectId);
			setProject(res.project);
			setBudgetAmount("");
			setActionMsg("Budget increased");
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			setActionMsg(`Failed to increase budget: ${message}`);
		}
	};

	const handleSpendBudget = async () => {
		if (!selectedProjectId) return;
		const amount = parseFloat(budgetAmount);
		if (!Number.isFinite(amount) || amount <= 0) {
			setActionMsg("Enter a positive amount");
			return;
		}
		setActionMsg(null);
		try {
			await projectsApi.spendBudget(selectedProjectId, amount);
			const res = await projectsApi.getProject(selectedProjectId);
			setProject(res.project);
			setBudgetAmount("");
			setActionMsg("Budget spent");
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			setActionMsg(`Failed to spend budget: ${message}`);
		}
	};

	const handleCreateProject = async () => {
		if (!teamId) return;
		if (!newProjectName.trim()) {
			setActionMsg("Enter a project name");
			return;
		}
		setCreatingProject(true);
		setActionMsg(null);
		try {
			const res = await projectsApi.createProject(teamId, newProjectName.trim(), newProjectDesc.trim() || undefined);
			const newId = res.project.id;
			setTeamProjectIds(prev => [...prev, newId]);
			setProjectNamesById(prev => ({ ...prev, [newId]: res.project.name }));
			setSelectedProjectId(newId);
			setNewProjectName("");
			setNewProjectDesc("");
			setActionMsg("Project created");
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			setActionMsg(`Failed to create project: ${message}`);
		} finally {
			setCreatingProject(false);
		}
	};

	const renderMemberLabel = (memberId: string) => {
		const byId = details?.members.find(m => m.id === memberId);
		if (byId) {
			const name = [byId.first_name, byId.last_name].filter(Boolean).join(" ");
			return name || byId.email;
		}
		return memberId;
	};

	return (
		<div className="min-h-screen bg-background p-8 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">{team?.name || (isFetchingTeams ? "Loading team..." : `Team ${teamId}`)}</h1>
				<button className="text-sm text-red-600 hover:underline" onClick={handleLeaveTeam}>Leave team</button>
			</div>
			<p className="text-gray-600">Team ID: {teamId}</p>

			{loading && <p>Loading team details...</p>}
			{error && <p className="text-red-600">Failed to load details: {error}</p>}

			{!loading && !error && (
				<>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-3">
								Invite Code
								<button className="text-sm text-purple-600 hover:underline" onClick={handleCopyInvite}>Copy</button>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<code className="px-2 py-1 bg-gray-100 rounded">{details?.code ?? ""}</code>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Members</CardTitle>
						</CardHeader>
						<CardContent>
							{memberIds.length === 0 ? (
								<p className="text-gray-600">No members found.</p>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Member</TableHead>
											<TableHead>Role</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{memberIds.map(mid => (
											<TableRow key={mid}>
												<TableCell className="font-mono text-sm">{renderMemberLabel(mid)}</TableCell>
												<TableCell>
													{execMemberIds.includes(mid) ? (
														<Badge variant="secondary">Exec</Badge>
													) : (
														<Badge variant="outline">Member</Badge>
													)}
												</TableCell>
												<TableCell className="text-right space-x-2">
													{!execMemberIds.includes(mid) && (
														<button className="text-purple-600 text-sm hover:underline" onClick={() => handlePromote(mid)}>Promote</button>
													)}
													<button className="text-red-600 text-sm hover:underline" onClick={() => handleKick(mid)}>Kick</button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Budget</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{teamProjectIds.length === 0 ? (
								<div className="space-y-2">
									<p className="text-gray-600">No projects in this team. Create one to manage budget.</p>
									<div className="flex flex-col gap-2 max-w-md">
										<input className="border rounded px-2 py-1" placeholder="Project name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
										<textarea className="border rounded px-2 py-1" placeholder="Description (optional)" value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} />
										<button className="bg-purple-600 text-white px-3 py-1 rounded w-fit" disabled={creatingProject} onClick={handleCreateProject}>{creatingProject ? "Creating..." : "Create Project"}</button>
									</div>
								</div>
							) : (
								<>
									<div className="flex items-center gap-2">
										<label htmlFor="projectSelect" className="text-sm">Project</label>
										<select
											id="projectSelect"
											className="border rounded px-2 py-1"
											value={selectedProjectId ?? ""}
											onChange={(e) => setSelectedProjectId(e.target.value || null)}
										>
											{teamProjectIds.map(pid => (
												<option key={pid} value={pid}>{projectNamesById[pid] || pid}</option>
											))}
										</select>
									</div>
									{projectLoading ? (
										<p>Loading project...</p>
									) : projectError ? (
										<p className="text-red-600">{projectError}</p>
									) : project ? (
										<div className="space-y-2">
											<p>Available: <strong>${project.budget_available.toFixed(2)}</strong></p>
											<p>Spent: <strong>${project.budget_spent.toFixed(2)}</strong></p>
											<div className="flex items-center gap-2">
												<input
													type="number"
													step="0.01"
													className="border rounded px-2 py-1 w-32"
													placeholder="Amount"
													value={budgetAmount}
													onChange={(e) => setBudgetAmount(e.target.value)}
												/>
												<button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleIncreaseBudget}>Increase</button>
												<button className="bg-orange-600 text-white px-3 py-1 rounded" onClick={handleSpendBudget}>Spend</button>
											</div>
										</div>
									) : null}
								</>
							)}
						</CardContent>
					</Card>

					{actionMsg && (
						<p className="text-sm text-gray-700">{actionMsg}</p>
					)}
				</>
			)}
		</div>
	);
}
