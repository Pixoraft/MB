import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PieChart } from "@/components/charts/pie-chart";
import { FloatingButton } from "@/components/ui/floating-button";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { TaskModal } from "@/components/modals/task-modal";
import { Task, InsertTask } from "@shared/schema";
import { getTodayString, calculatePerformance } from "@/lib/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DailyTask() {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = getTodayString();

  // Fetch tasks for today
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks", today],
    queryFn: async () => {
      const response = await fetch(`/api/tasks?date=${today}`);
      return response.json();
    },
  });

  // Fetch water intake for today
  const { data: waterIntake } = useQuery({
    queryKey: ["/api/water-intake", today],
    queryFn: async () => {
      const response = await fetch(`/api/water-intake?date=${today}`);
      return response.json();
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", newTask);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete task", variant: "destructive" });
    },
  });

  // Update streak mutation
  const updateStreakMutation = useMutation({
    mutationFn: async (updates: { current: number; highest: number }) => {
      const response = await apiRequest("PATCH", "/api/streak", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/streak"] });
    },
    onError: () => {
      // Don't show error toast for streak updates to avoid spam
    },
  });

  // Calculate completion rates
  const completedTasks = tasks.filter((task: Task) => task.completed).length;
  const taskCompletionRate = calculatePerformance(completedTasks, tasks.length);

  const waterPercentage = waterIntake 
    ? calculatePerformance(waterIntake.amount, waterIntake.goal)
    : 0;

  const handleTaskToggle = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { 
        completed: !task.completed,
        status: !task.completed ? "completed" : "pending"
      }
    });

    // Update streak when completing a task
    if (!task.completed) {
      // Calculate new completion rate after this task is completed
      const newCompletedCount = completedTasks + 1;
      const newCompletionRate = calculatePerformance(newCompletedCount, tasks.length);
      
      // If completion rate reaches 100%, increment streak
      if (newCompletionRate === 100) {
        // For now, just increment by 1. In a real app, you'd have more complex logic
        const newCurrent = 1; // This should be calculated based on previous days
        const newHighest = Math.max(newCurrent, 1);
        updateStreakMutation.mutate({ current: newCurrent, highest: newHighest });
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleSaveTask = (taskData: InsertTask) => {
    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        updates: taskData
      });
    } else {
      createTaskMutation.mutate(taskData);
    }
    setEditingTask(undefined);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg border-0 font-semibold px-4 py-2",
      "in-progress": "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg border-0 font-semibold px-4 py-2",
      pending: "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg border-0 font-semibold px-4 py-2"
    };
    
    const labels = {
      completed: "✓ Completed",
      "in-progress": "⏳ In Progress", 
      pending: "⏸️ Pending"
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {labels[status as keyof typeof labels] || "⏸️ Pending"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="page-title text-gradient-primary">Daily Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your daily tasks and track your progress</p>
        </div>

        {/* Top Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Task Completion Chart */}
          <div className="card-clean">
            <h2 className="section-title">📋 Task Completion</h2>
            <PieChart
              data={[taskCompletionRate, 100 - taskCompletionRate]}
              colors={['#8B5DFF', '#E2E8F0']}
            />
            <div className="text-center mt-4">
              <span className="text-3xl font-bold text-gradient-primary">{taskCompletionRate}%</span>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed Today</div>
            </div>
          </div>

          {/* Water Intake Chart */}
          <div className="card-clean">
            <h2 className="section-title">💧 Water Intake</h2>
            <PieChart
              data={[waterPercentage, 100 - waterPercentage]}
              colors={['#22C55E', '#E2E8F0']}
            />
            <div className="text-center mt-4">
              <span className="text-3xl font-bold text-gradient-secondary">{waterPercentage}%</span>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                of Daily Goal ({waterIntake?.goal || 2400}ml)
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="card-clean">
          <h2 className="section-title">✅ Today's Tasks</h2>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-600 dark:text-gray-400">No tasks for today</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Click the + button to add your first task!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task: Task) => (
                <div
                  key={task.id}
                  className="item-clean"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleTaskToggle(task)}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className={`text-base font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </div>
                        {task.time && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            ⏰ {task.time}
                            {task.duration && ` • ⏱️ ${task.duration} min`}
                          </div>
                        )}
                        {task.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(task.status)}
                      <ThreeDotMenu
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        <FloatingButton
          onClick={() => {
            setEditingTask(undefined);
            setShowTaskModal(true);
          }}
        />

        {/* Task Modal */}
        <TaskModal
          open={showTaskModal}
          onOpenChange={setShowTaskModal}
          onSave={handleSaveTask}
          task={editingTask}
        />
      </div>
    </div>
  );
}
