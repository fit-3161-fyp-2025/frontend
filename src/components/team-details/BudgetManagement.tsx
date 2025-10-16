import { useState } from "react";
import { toast } from "sonner";
import { projectsApi } from "@/api/projects";
import type { Project } from "@/types/projects";
import { parseErrorMessage } from "@/utils/errorParser";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BudgetManagementProps {
  selectedProjectId: string;
  projectName: string;
  project: Project;
  onBudgetUpdate: (updatedProject: Project) => void;
}

export function BudgetManagement({
  selectedProjectId,
  projectName,
  project,
  onBudgetUpdate,
}: BudgetManagementProps) {
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [showAddBudgetDialog, setShowAddBudgetDialog] = useState(false);
  const [showSpendBudgetDialog, setShowSpendBudgetDialog] = useState(false);

  const handleIncreaseBudget = async () => {
    const amount = parseFloat(budgetAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a positive number");
      return;
    }
    try {
      await projectsApi.increaseBudget(selectedProjectId, amount);
      const res = await projectsApi.getProject(selectedProjectId);
      onBudgetUpdate(res.project);
      setBudgetAmount("");
      setShowAddBudgetDialog(false);
      toast.success("Budget added successfully");
    } catch (e) {
      const errorInfo = parseErrorMessage(e);
      toast.error(errorInfo.description);
    }
  };

  const handleSpendBudget = async () => {
    const amount = parseFloat(budgetAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a positive number");
      return;
    }
    try {
      await projectsApi.spendBudget(selectedProjectId, amount);
      const res = await projectsApi.getProject(selectedProjectId);
      onBudgetUpdate(res.project);
      setBudgetAmount("");
      setShowSpendBudgetDialog(false);
      toast.success("Budget spent successfully");
    } catch (e) {
      const errorInfo = parseErrorMessage(e);
      toast.error(errorInfo.description);
    }
  };

  const totalBudget = project.budget_available + project.budget_spent;

  return (
    <>
      <div className="border-t pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-lg text-foreground">
            {projectName} Budget Management
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="font-bold text-lg">${totalBudget.toFixed(2)}</span>
          </div>
        </div>

        {/* Budget Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Available Budget */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Available Budget
                </h5>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${project.budget_available.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 font-bold">
                  ✓
                </span>
              </div>
            </div>
          </div>

          {/* Spent Budget */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Budget Spent
                </h5>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${project.budget_spent.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 font-bold">
                  $
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Actions */}
        <div className="bg-muted rounded-lg p-4">
          <h5 className="font-medium text-foreground mb-3">Budget Actions</h5>
          <div className="flex flex-wrap gap-3">
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
              onClick={() => {
                setBudgetAmount("");
                setShowAddBudgetDialog(true);
              }}
            >
              + Add Budget
            </button>
            <button
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90"
              onClick={() => {
                setBudgetAmount("");
                setShowSpendBudgetDialog(true);
              }}
            >
              - Spend Budget
            </button>
          </div>
        </div>
      </div>

      {/* Add Budget Dialog */}
      <Dialog open={showAddBudgetDialog} onOpenChange={setShowAddBudgetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
            <DialogDescription>
              Enter the amount you want to add to the project budget.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter amount"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  budgetAmount &&
                  parseFloat(budgetAmount) > 0
                ) {
                  handleIncreaseBudget();
                }
              }}
            />
          </div>
          <DialogFooter>
            <button
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80"
              onClick={() => {
                setShowAddBudgetDialog(false);
                setBudgetAmount("");
              }}
            >
              Cancel
            </button>
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!budgetAmount || parseFloat(budgetAmount) <= 0}
              onClick={handleIncreaseBudget}
            >
              Add Budget
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spend Budget Dialog */}
      <Dialog
        open={showSpendBudgetDialog}
        onOpenChange={setShowSpendBudgetDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Spend Budget</DialogTitle>
            <DialogDescription>
              Enter the amount you want to spend from the project budget.
              <span className="block mt-2 text-green-600 dark:text-green-400 font-medium">
                Available: ${project.budget_available.toFixed(2)}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={project.budget_available}
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter amount"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  budgetAmount &&
                  parseFloat(budgetAmount) > 0 &&
                  parseFloat(budgetAmount) <= project.budget_available
                ) {
                  handleSpendBudget();
                }
              }}
            />
            {budgetAmount &&
              parseFloat(budgetAmount) > project.budget_available && (
                <p className="text-destructive text-sm mt-2">
                  Amount exceeds available budget
                </p>
              )}
          </div>
          <DialogFooter>
            <button
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80"
              onClick={() => {
                setShowSpendBudgetDialog(false);
                setBudgetAmount("");
              }}
            >
              Cancel
            </button>
            <button
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !budgetAmount ||
                parseFloat(budgetAmount) <= 0 ||
                parseFloat(budgetAmount) > project.budget_available
              }
              onClick={handleSpendBudget}
            >
              Spend Budget
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
