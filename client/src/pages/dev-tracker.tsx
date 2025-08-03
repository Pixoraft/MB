import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FloatingButton } from "@/components/ui/floating-button";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { GoalModal } from "@/components/modals/goal-modal";
import { Goal, InsertGoal } from "@shared/schema";
import { calculatePerformance } from "@/lib/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function DevTracker() {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch goals by type
  const { data: weeklyGoals = [] } = useQuery({
    queryKey: ["/api/goals", "weekly"],
    queryFn: async () => {
      const response = await fetch("/api/goals?type=weekly");
      return response.json();
    },
  });

  const { data: monthlyGoals = [] } = useQuery({
    queryKey: ["/api/goals", "monthly"],
    queryFn: async () => {
      const response = await fetch("/api/goals?type=monthly");
      return response.json();
    },
  });

  const { data: yearlyGoals = [] } = useQuery({
    queryKey: ["/api/goals", "yearly"],
    queryFn: async () => {
      const response = await fetch("/api/goals?type=yearly");
      return response.json();
    },
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (newGoal: InsertGoal) => {
      const response = await apiRequest("POST", "/api/goals", newGoal);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
      const response = await apiRequest("PATCH", `/api/goals/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update goal", variant: "destructive" });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete goal", variant: "destructive" });
    },
  });

  // Calculate progress percentages
  const completedWeeklyGoals = weeklyGoals.filter((goal: Goal) => goal.completed).length;
  const weeklyProgress = calculatePerformance(completedWeeklyGoals, weeklyGoals.length);

  const completedMonthlyGoals = monthlyGoals.filter((goal: Goal) => goal.completed).length;
  const monthlyProgress = calculatePerformance(completedMonthlyGoals, monthlyGoals.length);

  const yearlyGoalProgress = yearlyGoals.length > 0 ? yearlyGoals[0].progress : 0;

  const handleGoalToggle = (goal: Goal) => {
    updateGoalMutation.mutate({
      id: goal.id,
      updates: { completed: !goal.completed }
    });
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  const handleSaveGoal = (goalData: InsertGoal) => {
    if (editingGoal) {
      updateGoalMutation.mutate({
        id: editingGoal.id,
        updates: goalData
      });
    } else {
      createGoalMutation.mutate(goalData);
    }
    setEditingGoal(undefined);
  };

  const getStatusBadge = (goal: Goal) => {
    if (goal.completed) {
      return <Badge className="bg-green-500 text-white">Completed</Badge>;
    }
    if (goal.progress > 0) {
      return <Badge className="bg-yellow-500 text-white">In Progress</Badge>;
    }
    return <Badge className="bg-gray-500 text-white">Pending</Badge>;
  };

  const getCurrentWeekRange = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${format(start, 'MMM d')}-${format(end, 'd, yyyy')}`;
  };

  const getCurrentMonth = () => {
    return format(new Date(), 'MMMM yyyy');
  };

  const getCurrentYear = () => {
    return new Date().getFullYear().toString();
  };

  const GoalSection = ({ 
    title, 
    icon, 
    goals, 
    progress, 
    dateRange,
    emptyMessage 
  }: { 
    title: string; 
    icon: string; 
    goals: Goal[]; 
    progress: number;
    dateRange: string;
    emptyMessage: string;
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            {icon} {title}
            <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
              ({dateRange})
            </span>
          </CardTitle>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{goals.filter(g => g.completed).length}</span> of{" "}
            <span className="font-medium">{goals.length}</span> goals completed
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progress} className="w-full h-2" />
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal: Goal) => (
              <div
                key={goal.id}
                className="goal-item flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <Checkbox
                    checked={goal.completed}
                    onCheckedChange={() => handleGoalToggle(goal)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className={`text-gray-900 dark:text-white font-medium ${goal.completed ? 'line-through' : ''}`}>
                      {goal.title}
                    </div>
                    {goal.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {goal.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(goal)}
                  <ThreeDotMenu
                    onEdit={() => handleEditGoal(goal)}
                    onDelete={() => handleDeleteGoal(goal.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dev Tracker</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Track your development goals from weekly to yearly objectives</p>
      </div>

      {/* Goal Sections */}
      <div className="space-y-8">
        <GoalSection
          title="Weekly Plan"
          icon="🗓️"
          goals={weeklyGoals}
          progress={weeklyProgress}
          dateRange={getCurrentWeekRange()}
          emptyMessage="No weekly goals set. Click the + button to add your first weekly goal!"
        />

        <GoalSection
          title="Monthly Plan"
          icon="📅"
          goals={monthlyGoals}
          progress={monthlyProgress}
          dateRange={getCurrentMonth()}
          emptyMessage="No monthly goals set. Click the + button to add your first monthly goal!"
        />

        {/* Yearly Goal - Special Layout */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                📈 Yearly Goal
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  ({getCurrentYear()})
                </span>
              </CardTitle>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{yearlyGoalProgress}%</span> progress
              </div>
            </div>
            <div className="mt-4">
              <Progress value={yearlyGoalProgress} className="w-full h-2" />
            </div>
          </CardHeader>
          <CardContent>
            {yearlyGoals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No yearly goal set. Click the + button to set your yearly development goal!
              </div>
            ) : (
              <div className="space-y-4">
                {yearlyGoals.map((goal: Goal) => (
                  <div
                    key={goal.id}
                    className="goal-item p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm">🎯</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {goal.title}
                          </div>
                          <ThreeDotMenu
                            onEdit={() => handleEditGoal(goal)}
                            onDelete={() => handleDeleteGoal(goal.id)}
                          />
                        </div>
                        {goal.description && (
                          <div className="text-gray-600 dark:text-gray-400 mb-4">
                            {goal.description}
                          </div>
                        )}
                        
                        {/* Sub-goals progress - This would be calculated from related goals */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">Weekly goals completion</span>
                            <span className="font-medium text-success">{weeklyProgress}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">Monthly goals completion</span>
                            <span className="font-medium text-warning">{monthlyProgress}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">Overall progress</span>
                            <span className="font-medium text-primary">{goal.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Add Button */}
      <FloatingButton
        onClick={() => {
          setEditingGoal(undefined);
          setShowGoalModal(true);
        }}
      />

      {/* Goal Modal */}
      <GoalModal
        open={showGoalModal}
        onOpenChange={setShowGoalModal}
        onSave={handleSaveGoal}
        goal={editingGoal}
      />
    </div>
  );
}
