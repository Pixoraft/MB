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
      completed: "bg-green-500 text-white",
      "in-progress": "bg-yellow-500 text-white",
      pending: "bg-gray-500 text-white"
    };
    
    const labels = {
      completed: "Completed",
      "in-progress": "In Progress",
      pending: "Pending"
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {labels[status as keyof typeof labels] || "Pending"}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Tasks</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your daily tasks and track your progress</p>
      </div>

      {/* Top Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Task Completion Chart */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={[taskCompletionRate, 100 - taskCompletionRate]}
              colors={['hsl(var(--secondary))', 'hsl(var(--muted))']}
            />
            <div className="text-center mt-4">
              <span className="text-2xl font-bold text-primary">{taskCompletionRate}%</span>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed Today</div>
            </div>
          </CardContent>
        </Card>

        {/* Water Intake Chart */}
        <Card>
          <CardHeader>
            <CardTitle>💧 Water Intake</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={[waterPercentage, 100 - waterPercentage]}
              colors={['hsl(var(--primary))', 'hsl(var(--muted))']}
            />
            <div className="text-center mt-4">
              <span className="text-2xl font-bold text-secondary">{waterPercentage}%</span>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                of Daily Goal ({waterIntake?.goal || 2400}ml)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks for today. Click the + button to add your first task!
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task: Task) => (
                <div
                  key={task.id}
                  className="task-item flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleTaskToggle(task)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className={`text-gray-900 dark:text-white font-medium ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </div>
                      {task.time && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {task.time}
                          {task.duration && ` • ${task.duration} min`}
                        </div>
                      )}
                      {task.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(task.status)}
                    <ThreeDotMenu
                      onEdit={() => handleEditTask(task)}
                      onDelete={() => handleDeleteTask(task.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
  );
}
