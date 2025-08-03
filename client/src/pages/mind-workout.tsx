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

  // Default mind activities that users can interact with
  const defaultActivities = [
    {
      id: "default-1",
      name: "Box Breathing + Sense Drill",
      description: "4-4-4-4 breathing pattern + 5-4-3-2-1 grounding technique",
      time: "05:40",
      chatgptRole: "ChatGPT: Guide through breathing patterns",
      completed: false,
      date: today,
      status: "pending" as const
    },
    {
      id: "default-2",
      name: "Memory Palace Practice",
      description: "Memorize 5 items using visual story technique, rate memory strength",
      time: "06:00",
      chatgptRole: "ChatGPT: Generate items & review performance",
      completed: false,
      date: today,
      status: "pending" as const
    },
    {
      id: "default-3",
      name: "Micro Brain Challenge",
      description: "Daily hard riddle or logic puzzle to stimulate problem-solving",
      time: "08:00",
      chatgptRole: "ChatGPT: Provide challenge & hints",
      completed: false,
      date: today,
      status: "pending" as const
    },
    {
      id: "default-4",
      name: "Pattern Recognition Task",
      description: "Visual or scene-based pattern identification challenge",
      time: "12:00",
      chatgptRole: "ChatGPT: Provide pattern task",
      completed: false,
      date: today,
      status: "pending" as const
    },
    {
      id: "default-5",
      name: "Recall & Visualization",
      description: "Recall 3 sounds, 2 visual scenes, 1 specific feeling from today",
      time: "16:00",
      chatgptRole: "ChatGPT: Quiz & evaluate recall",
      completed: false,
      date: today,
      status: "pending" as const
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
  ];

  // State to track default activity completion with localStorage persistence
  const getStoredActivityStates = () => {
    const stored = localStorage.getItem(`mindActivityStates_${today}`);
    return stored ? JSON.parse(stored) : {};
  };

  const [defaultActivityStates, setDefaultActivityStates] = useState<{[key: string]: boolean}>(getStoredActivityStates);
  
  // Handle default activity toggle
  const handleDefaultActivityToggle = (activityId: string) => {
    const newStates = {
      ...defaultActivityStates,
      [activityId]: !defaultActivityStates[activityId]
    };
    setDefaultActivityStates(newStates);
    localStorage.setItem(`mindActivityStates_${today}`, JSON.stringify(newStates));
  };

  // Merge real activities with default activities with current state
  const displayActivities = mindActivities.length > 0 ? mindActivities : 
    defaultActivities.map(activity => ({
      ...activity,
      completed: defaultActivityStates[activity.id] || false,
      status: defaultActivityStates[activity.id] ? "completed" as const : "pending" as const
    }));
  
  const completedCount = displayActivities.filter((activity: any) => activity.completed).length;
  const displayCompletionRate = calculatePerformance(completedCount, displayActivities.length);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Mind Workout</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Structured mental exercises to enhance cognitive performance</p>
        </div>

        {/* Mind Exercise Completion Chart */}
        <Card className="premium-card relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">🧠 Mind Exercise Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative">
                <PieChart
                  data={[displayCompletionRate, 100 - displayCompletionRate]}
                  colors={['#8B5DFF', '#E2E8F0']}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-black text-gradient-primary block">{displayCompletionRate}%</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Complete</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black text-gradient-secondary mb-4">{displayCompletionRate}%</div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">Daily Completion Rate</div>
                <div className="premium-card p-4 inline-block">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-2xl font-bold text-gradient-primary">{completedCount}</span>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-2xl font-bold text-gradient-secondary">{displayActivities.length}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">exercises completed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Structured Schedule */}
        <Card className="premium-card relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/5 to-transparent rounded-tr-full"></div>
          <CardHeader>
            <CardTitle className="text-2xl text-gradient-primary">🕐 Daily Mind Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {displayActivities.map((activity: any) => (
                <div
                  key={activity.id}
                  className="mind-activity premium-card p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-6 flex-1">
                      <Checkbox
                        checked={activity.completed}
                        onCheckedChange={() => {
                          if (mindActivities.length > 0) {
                            handleActivityToggle(activity);
                          } else {
                            handleDefaultActivityToggle(activity.id);
                          }
                        }}
                        className="w-6 h-6 border-2 border-primary/30 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:to-accent"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="bg-gradient-to-r from-primary to-accent text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg">
                            ⏰ {activity.time}
                          </div>
                          <div className={`text-lg font-semibold ${activity.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'} transition-colors`}>
                            {activity.name}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                          📝 {activity.description}
                        </div>
                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300 text-xs font-semibold px-3 py-2 rounded-lg inline-block border border-purple-200/50 dark:border-purple-700/50">
                          🤖 {activity.chatgptRole}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(activity.status)}
                      <ThreeDotMenu
                        onEdit={() => {
                          if (mindActivities.length > 0) {
                            handleEditActivity(activity);
                          } else {
                            // For default activities, create a new activity based on the default
                            setEditingActivity(undefined);
                            setShowActivityModal(true);
                          }
                        }}
                        onDelete={() => {
                          if (mindActivities.length > 0) {
                            handleDeleteActivity(activity.id);
                          } else {
                            // Reset default activity state
                            setDefaultActivityStates(prev => {
                              const newState = { ...prev };
                              delete newState[activity.id];
                              return newState;
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
            ))}
          </div>
            
            {mindActivities.length === 0 && (
              <div className="premium-card p-6 mt-8 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">💡</span>
                  </div>
                  <h4 className="font-bold text-blue-700 dark:text-blue-300">Default Activities</h4>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Above are premium mind workout activities designed by experts. Click the + button to create your own custom activities!
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
    </div>
  );
}
