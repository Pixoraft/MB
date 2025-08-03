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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-black text-gradient-primary mb-4">Daily Tasks</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Manage your daily tasks and track your progress with beautiful insights</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-6"></div>
        </div>

        {/* Top Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Task Completion Chart */}
          <Card className="premium-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
            <CardHeader>
              <CardTitle className="text-2xl text-gradient-primary">📋 Task Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart
                data={[taskCompletionRate, 100 - taskCompletionRate]}
                colors={['#8B5DFF', '#E2E8F0']}
              />
              <div className="text-center mt-6">
                <span className="text-4xl font-black text-gradient-primary mb-2 block">{taskCompletionRate}%</span>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Today</div>
              </div>
            </CardContent>
          </Card>

          {/* Water Intake Chart */}
          <Card className="premium-card relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-br-full"></div>
            <CardHeader>
              <CardTitle className="text-2xl text-gradient-primary">💧 Water Intake</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart
                data={[waterPercentage, 100 - waterPercentage]}
                colors={['#22C55E', '#E2E8F0']}
              />
              <div className="text-center mt-6">
                <span className="text-4xl font-black text-gradient-secondary mb-2 block">{waterPercentage}%</span>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  of Daily Goal ({waterIntake?.goal || 2400}ml)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <Card className="premium-card relative overflow-hidden mb-8">
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full"></div>
          <CardHeader>
            <CardTitle className="text-2xl text-gradient-primary">✅ Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">📝</span>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">No tasks for today</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Click the + button to add your first task!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className="task-item premium-card p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-6 flex-1">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleTaskToggle(task)}
                          className="w-6 h-6 border-2 border-primary/30 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:to-accent"
                        />
                        <div className="flex-1">
                          <div className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'} transition-colors`}>
                            {task.title}
                          </div>
                          {task.time && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                              ⏰ {task.time}
                              {task.duration && ` • ⏱️ ${task.duration} min`}
                            </div>
                          )}
                          {task.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
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
    </div>
  );
}
