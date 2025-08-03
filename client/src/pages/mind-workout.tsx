import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PieChart } from "@/components/charts/pie-chart";
import { FloatingButton } from "@/components/ui/floating-button";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { MindActivityModal } from "@/components/modals/mind-activity-modal";
import { MindActivity, InsertMindActivity } from "@shared/schema";
import { getTodayString, calculatePerformance } from "@/lib/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MindWorkout() {
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<MindActivity | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = getTodayString();

  // Fetch mind activities for today
  const { data: mindActivities = [] } = useQuery({
    queryKey: ["/api/mind-activities", today],
    queryFn: async () => {
      const response = await fetch(`/api/mind-activities?date=${today}`);
      return response.json();
    },
  });

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (newActivity: InsertMindActivity) => {
      const response = await apiRequest("POST", "/api/mind-activities", newActivity);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mind-activities"] });
      toast({ title: "Mind activity created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create activity", variant: "destructive" });
    },
  });

  // Update activity mutation
  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MindActivity> }) => {
      const response = await apiRequest("PATCH", `/api/mind-activities/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mind-activities"] });
      toast({ title: "Mind activity updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update activity", variant: "destructive" });
    },
  });

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/mind-activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mind-activities"] });
      toast({ title: "Mind activity deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete activity", variant: "destructive" });
    },
  });

  // Calculate completion rate
  const completedActivities = mindActivities.filter((activity: MindActivity) => activity.completed).length;
  const completionRate = calculatePerformance(completedActivities, mindActivities.length);

  const handleActivityToggle = (activity: MindActivity) => {
    updateActivityMutation.mutate({
      id: activity.id,
      updates: { 
        completed: !activity.completed,
        status: !activity.completed ? "completed" : "pending"
      }
    });
  };

  const handleEditActivity = (activity: MindActivity) => {
    setEditingActivity(activity);
    setShowActivityModal(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (confirm("Are you sure you want to delete this mind activity?")) {
      deleteActivityMutation.mutate(activityId);
    }
  };

  const handleSaveActivity = (activityData: InsertMindActivity) => {
    if (editingActivity) {
      updateActivityMutation.mutate({
        id: editingActivity.id,
        updates: activityData
      });
    } else {
      createActivityMutation.mutate(activityData);
    }
    setEditingActivity(undefined);
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

  // Default mind activities for demo purposes (in production, these would be user-created)
  const defaultActivities = mindActivities.length === 0 ? [
    {
      id: "default-1",
      name: "Box Breathing + Sense Drill",
      description: "4-4-4-4 breathing pattern + 5-4-3-2-1 grounding technique",
      time: "05:40",
      chatgptRole: "ChatGPT: Guide through breathing patterns",
      completed: true,
      date: today,
      status: "completed" as const
    },
    {
      id: "default-2",
      name: "Memory Palace Practice",
      description: "Memorize 5 items using visual story technique, rate memory strength",
      time: "06:00",
      chatgptRole: "ChatGPT: Generate items & review performance",
      completed: true,
      date: today,
      status: "completed" as const
    },
    {
      id: "default-3",
      name: "Micro Brain Challenge",
      description: "Daily hard riddle or logic puzzle to stimulate problem-solving",
      time: "08:00",
      chatgptRole: "ChatGPT: Provide challenge & hints",
      completed: true,
      date: today,
      status: "completed" as const
    },
    {
      id: "default-4",
      name: "Pattern Recognition Task",
      description: "Visual or scene-based pattern identification challenge",
      time: "12:00",
      chatgptRole: "ChatGPT: Provide pattern task",
      completed: true,
      date: today,
      status: "completed" as const
    },
    {
      id: "default-5",
      name: "Recall & Visualization",
      description: "Recall 3 sounds, 2 visual scenes, 1 specific feeling from today",
      time: "16:00",
      chatgptRole: "ChatGPT: Quiz & evaluate recall",
      completed: false,
      date: today,
      status: "in-progress" as const
    },
    {
      id: "default-6",
      name: "Mental Map Review",
      description: "Recall and review everything learned throughout the day",
      time: "19:00",
      chatgptRole: "ChatGPT: Quiz knowledge & score performance",
      completed: false,
      date: today,
      status: "pending" as const
    },
    {
      id: "default-7",
      name: "Mind Wind-down",
      description: "Self-reflection questions and mental preparation for rest",
      time: "21:30",
      chatgptRole: "ChatGPT: Guide reflection process",
      completed: false,
      date: today,
      status: "pending" as const
    }
  ] : mindActivities;

  const displayActivities = mindActivities.length > 0 ? mindActivities : defaultActivities;
  const completedCount = displayActivities.filter((activity: any) => activity.completed).length;
  const displayCompletionRate = calculatePerformance(completedCount, displayActivities.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mind Workout</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Structured mental exercises to enhance cognitive performance</p>
      </div>

      {/* Mind Exercise Completion Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>🧠 Mind Exercise Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <PieChart
              data={[displayCompletionRate, 100 - displayCompletionRate]}
              colors={['hsl(142, 71%, 45%)', 'hsl(var(--muted))']}
            />
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{displayCompletionRate}%</div>
              <div className="text-gray-600 dark:text-gray-400">Daily Completion Rate</div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{completedCount}</span> of{" "}
                <span className="font-medium">{displayActivities.length}</span> exercises completed
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structured Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>🕐 Daily Mind Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayActivities.map((activity: any) => (
              <div
                key={activity.id}
                className="mind-activity flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <Checkbox
                    checked={activity.completed}
                    onCheckedChange={() => mindActivities.length > 0 && handleActivityToggle(activity)}
                    className="w-5 h-5"
                    disabled={mindActivities.length === 0}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {activity.time}
                      </div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {activity.name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {activity.description}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded inline-block">
                      {activity.chatgptRole}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(activity.status)}
                  {mindActivities.length > 0 && (
                    <ThreeDotMenu
                      onEdit={() => handleEditActivity(activity)}
                      onDelete={() => handleDeleteActivity(activity.id)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {mindActivities.length === 0 && (
            <div className="text-center mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Above are default mind workout activities. Click the + button to create your own custom activities!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Add Button */}
      <FloatingButton
        onClick={() => {
          setEditingActivity(undefined);
          setShowActivityModal(true);
        }}
      />

      {/* Mind Activity Modal */}
      <MindActivityModal
        open={showActivityModal}
        onOpenChange={setShowActivityModal}
        onSave={handleSaveActivity}
        activity={editingActivity}
      />
    </div>
  );
}
