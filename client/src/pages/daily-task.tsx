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
  const { data: waterIntake = { date: today, amount: 0, goal: 2400 } } = useQuery({
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

  // Water intake mutation
  const updateWaterMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/water-intake", {
        date: today,
        amount,
        goal: waterIntake.goal || 2400
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-intake"] });
    },
    onError: () => {
      toast({ title: "Failed to update water intake", variant: "destructive" });
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

  // Water tracking functions
  const addWater = (ml: number) => {
    const newAmount = (waterIntake?.amount || 0) + ml;
    updateWaterMutation.mutate(newAmount);
  };

  const removeWater = (ml: number) => {
    const newAmount = Math.max(0, (waterIntake?.amount || 0) - ml);
    updateWaterMutation.mutate(newAmount);
  };

  const glassesConsumed = Math.floor((waterIntake?.amount || 0) / 250); // 250ml per glass
  const totalGlasses = Math.ceil((waterIntake?.goal || 2400) / 250);

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
      completed: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg border-0 font-semibold px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm",
      "in-progress": "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg border-0 font-semibold px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm",
      pending: "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg border-0 font-semibold px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm"
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="page-title text-gradient-primary">Daily Tasks</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your daily tasks and track your progress</p>
        </div>

        {/* Top Charts */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {/* Task Completion Chart */}
          <div className="card-clean">
            <h2 className="section-title text-sm sm:text-base">📋 Tasks</h2>
            <div className="h-32 sm:h-48 md:h-64">
              <PieChart
                data={[taskCompletionRate, 100 - taskCompletionRate]}
                colors={['#8B5DFF', '#E2E8F0']}
              />
            </div>
            <div className="text-center mt-2 sm:mt-3 md:mt-4">
              <span className="text-lg sm:text-2xl md:text-3xl font-bold text-gradient-primary">{taskCompletionRate}%</span>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
          </div>

          {/* Water Intake Chart */}
          <div className="card-clean">
            <h2 className="section-title text-sm sm:text-base">💧 Water</h2>
            <div className="h-32 sm:h-48 md:h-64">
              <PieChart
                data={[waterPercentage, 100 - waterPercentage]}
                colors={['#22C55E', '#E2E8F0']}
              />
            </div>
            <div className="text-center mt-2 sm:mt-3 md:mt-4">
              <span className="text-lg sm:text-2xl md:text-3xl font-bold text-gradient-secondary">{waterPercentage}%</span>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                of {waterIntake?.goal || 2400}ml
              </div>
            </div>
          </div>
        </div>

        {/* Water Tracker */}
        <div className="card-clean mb-6 sm:mb-8">
          <h2 className="section-title">💧 Water Tracker</h2>
          
          {/* Current Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-6">
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-bold text-gradient-secondary mb-2">
                {waterIntake?.amount || 0}ml / {waterIntake?.goal || 2400}ml
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {glassesConsumed} of {totalGlasses} glasses (250ml each)
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full sm:w-64">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-cyan-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, waterPercentage)}%` }}
                ></div>
              </div>
              <div className="text-xs text-center mt-1 text-gray-500">
                {waterPercentage >= 100 ? "🎉 Goal Reached!" : `${100 - waterPercentage}% to go`}
              </div>
            </div>
          </div>

          {/* Glass Visualization */}
          <div className="flex flex-wrap justify-center items-center gap-2 mb-6">
            {Array.from({ length: totalGlasses }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-10 sm:w-10 sm:h-12 border-2 rounded-b-lg flex items-end justify-center text-xs font-bold transition-all duration-300 ${
                  i < glassesConsumed
                    ? 'border-blue-400 bg-gradient-to-t from-blue-200 to-blue-100 dark:from-blue-600 dark:to-blue-400 text-blue-700'
                    : 'border-gray-300 dark:border-gray-600 bg-transparent text-gray-400'
                }`}
              >
                {i < glassesConsumed ? '💧' : ''}
              </div>
            ))}
          </div>

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
            <button
              onClick={() => addWater(250)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg transition-all duration-200 text-xs sm:text-sm"
              disabled={updateWaterMutation.isPending}
            >
              +1 Glass
              <div className="text-xs opacity-80">(250ml)</div>
            </button>
            
            <button
              onClick={() => addWater(500)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg transition-all duration-200 text-xs sm:text-sm"
              disabled={updateWaterMutation.isPending}
            >
              +1 Bottle
              <div className="text-xs opacity-80">(500ml)</div>
            </button>
            
            <button
              onClick={() => addWater(1000)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg transition-all duration-200 text-xs sm:text-sm"
              disabled={updateWaterMutation.isPending}
            >
              +Big Bottle
              <div className="text-xs opacity-80">(1000ml)</div>
            </button>
            
            <button
              onClick={() => removeWater(250)}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg transition-all duration-200 text-xs sm:text-sm"
              disabled={updateWaterMutation.isPending || (waterIntake?.amount || 0) === 0}
            >
              -1 Glass
              <div className="text-xs opacity-80">(250ml)</div>
            </button>
          </div>

          {/* Motivational Messages */}
          <div className="text-center">
            {waterPercentage >= 100 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/50 rounded-lg p-3 sm:p-4">
                <div className="text-green-700 dark:text-green-300 font-semibold text-sm sm:text-base">
                  🎉 Excellent! You've reached your daily water goal!
                </div>
                <div className="text-green-600 dark:text-green-400 text-xs sm:text-sm mt-1">
                  Great job staying hydrated! Your body thanks you.
                </div>
              </div>
            )}
            
            {waterPercentage >= 75 && waterPercentage < 100 && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-3 sm:p-4">
                <div className="text-blue-700 dark:text-blue-300 font-semibold text-sm sm:text-base">
                  💪 Almost there! Just {(waterIntake?.goal || 2400) - (waterIntake?.amount || 0)}ml to go!
                </div>
              </div>
            )}
            
            {waterPercentage < 50 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-3 sm:p-4">
                <div className="text-yellow-700 dark:text-yellow-300 font-semibold text-sm sm:text-base">
                  💧 Stay hydrated! Remember to drink water regularly throughout the day.
                </div>
              </div>
            )}
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
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 w-full">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleTaskToggle(task)}
                        className="w-5 h-5 sm:w-5 sm:h-5 mt-1 sm:mt-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm sm:text-base font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </div>
                        {task.time && (
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                            ⏰ {task.time}
                            {task.duration && ` • ⏱️ ${task.duration} min`}
                          </div>
                        )}
                        {task.description && (
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-center">
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
