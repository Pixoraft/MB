import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PieChart } from "@/components/charts/pie-chart";
import { FloatingButton } from "@/components/ui/floating-button";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { RoutineModal } from "@/components/modals/routine-modal";
import { RoutineItem, InsertRoutineItem } from "@shared/schema";
import { getTodayString, calculatePerformance } from "@/lib/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DailyRoutine() {
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineItem | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = getTodayString();

  // Fetch routine items
  const { data: morningRoutines = [] } = useQuery({
    queryKey: ["/api/routine-items", "morning"],
    queryFn: async () => {
      const response = await fetch("/api/routine-items?type=morning");
      return response.json();
    },
  });

  const { data: nightRoutines = [] } = useQuery({
    queryKey: ["/api/routine-items", "night"],
    queryFn: async () => {
      const response = await fetch("/api/routine-items?type=night");
      return response.json();
    },
  });

  const { data: weeklyRoutines = [] } = useQuery({
    queryKey: ["/api/routine-items", "weekly"],
    queryFn: async () => {
      const response = await fetch("/api/routine-items?type=weekly");
      return response.json();
    },
  });

  // Create routine mutation
  const createRoutineMutation = useMutation({
    mutationFn: async (newRoutine: InsertRoutineItem) => {
      const response = await apiRequest("POST", "/api/routine-items", newRoutine);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routine-items"] });
      toast({ title: "Routine created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create routine", variant: "destructive" });
    },
  });

  // Update routine mutation
  const updateRoutineMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RoutineItem> }) => {
      const response = await apiRequest("PATCH", `/api/routine-items/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routine-items"] });
      toast({ title: "Routine updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update routine", variant: "destructive" });
    },
  });

  // Delete routine mutation
  const deleteRoutineMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/routine-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routine-items"] });
      toast({ title: "Routine deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete routine", variant: "destructive" });
    },
  });

  // Calculate completion rates
  const allRoutines = [...morningRoutines, ...nightRoutines, ...weeklyRoutines];
  const completedRoutines = allRoutines.filter((routine: RoutineItem) => routine.completed).length;
  const overallCompletionRate = calculatePerformance(completedRoutines, allRoutines.length);

  const completedMorning = morningRoutines.filter((r: RoutineItem) => r.completed).length;
  const morningCompletionRate = calculatePerformance(completedMorning, morningRoutines.length);

  const completedNight = nightRoutines.filter((r: RoutineItem) => r.completed).length;
  const nightCompletionRate = calculatePerformance(completedNight, nightRoutines.length);

  const completedWeekly = weeklyRoutines.filter((r: RoutineItem) => r.completed).length;
  const weeklyCompletionRate = calculatePerformance(completedWeekly, weeklyRoutines.length);

  const handleRoutineToggle = (routine: RoutineItem) => {
    updateRoutineMutation.mutate({
      id: routine.id,
      updates: { completed: !routine.completed }
    });
  };

  const handleEditRoutine = (routine: RoutineItem) => {
    setEditingRoutine(routine);
    setShowRoutineModal(true);
  };

  const handleDeleteRoutine = (routineId: string) => {
    if (confirm("Are you sure you want to delete this routine?")) {
      deleteRoutineMutation.mutate(routineId);
    }
  };

  const handleSaveRoutine = (routineData: InsertRoutineItem) => {
    if (editingRoutine) {
      updateRoutineMutation.mutate({
        id: editingRoutine.id,
        updates: routineData
      });
    } else {
      createRoutineMutation.mutate(routineData);
    }
    setEditingRoutine(undefined);
  };

  const RoutineSection = ({ 
    title, 
    icon, 
    routines, 
    emptyMessage 
  }: { 
    title: string; 
    icon: string; 
    routines: RoutineItem[]; 
    emptyMessage: string;
  }) => (
    <Card className="premium-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full"></div>
      <CardHeader>
        <CardTitle className="flex items-center space-x-3 text-2xl text-gradient-primary">
          <span className="text-3xl">{icon}</span>
          <span>{title}</span>
          <span className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary dark:text-accent text-sm font-bold px-3 py-1 rounded-full">
            {routines.length} activities
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {routines.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">{icon}</span>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">{emptyMessage.split('.')[0]}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Click the + button to add your first activity!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {routines.map((routine: RoutineItem) => (
              <div
                key={routine.id}
                className="routine-item premium-card p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-6 flex-1">
                    <Checkbox
                      checked={routine.completed}
                      onCheckedChange={() => handleRoutineToggle(routine)}
                      className="w-6 h-6 border-2 border-primary/30 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:to-accent"
                    />
                    <div className="flex-1">
                      <div className={`text-lg font-semibold ${routine.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'} transition-colors mb-2`}>
                        {routine.name}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <span className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary dark:text-accent px-2 py-1 rounded-lg font-bold">
                          ⏰ {routine.time}
                        </span>
                        <span className="bg-gradient-to-r from-secondary/20 to-accent/20 text-secondary dark:text-accent px-2 py-1 rounded-lg font-bold">
                          ⏱️ {routine.duration} min
                        </span>
                        {routine.days && routine.days.length > 0 && (
                          <div className="flex space-x-1">
                            {routine.days.map((day) => (
                              <Badge key={day} className="bg-gradient-to-r from-gray-500 to-slate-600 text-white text-xs font-semibold px-2 py-1">
                                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={routine.completed 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg border-0 font-semibold px-4 py-2" 
                      : "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg border-0 font-semibold px-4 py-2"
                    }>
                      {routine.completed ? "✅ Done" : "⏸️ Pending"}
                    </Badge>
                    <ThreeDotMenu
                      onEdit={() => handleEditRoutine(routine)}
                      onDelete={() => handleDeleteRoutine(routine.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-black text-gradient-primary mb-4">Daily Routine</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Manage your morning, night, and weekly routines with beautiful insights</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-6"></div>
        </div>

        {/* Routine Completion Chart */}
        <Card className="premium-card relative overflow-hidden mb-12">
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-accent/10 to-transparent rounded-br-full"></div>
          <CardHeader>
            <CardTitle className="text-2xl text-gradient-primary">🔁 Routine Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative">
                <PieChart
                  data={[overallCompletionRate, 100 - overallCompletionRate]}
                  colors={['#EF4444', '#E2E8F0']}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-black text-gradient-primary block">{overallCompletionRate}%</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Complete</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black text-gradient-secondary mb-4">{overallCompletionRate}%</div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-8">Overall Completion Rate</div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="premium-card p-4">
                    <div className="text-2xl font-black text-gradient-primary mb-1">{morningCompletionRate}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">☀️ Morning</div>
                  </div>
                  <div className="premium-card p-4">
                    <div className="text-2xl font-black text-gradient-secondary mb-1">{nightCompletionRate}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">🌙 Night</div>
                  </div>
                  <div className="premium-card p-4">
                    <div className="text-2xl font-black text-gradient-primary mb-1">{weeklyCompletionRate}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">📆 Weekly</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routine Sections */}
        <div className="space-y-12">
          <RoutineSection
            title="Morning Routine"
            icon="☀️"
            routines={morningRoutines}
            emptyMessage="No morning routines set up. Click the + button to add your first morning activity!"
          />

          <RoutineSection
            title="Night Routine"
            icon="🌙"
            routines={nightRoutines}
            emptyMessage="No night routines set up. Click the + button to add your first night activity!"
          />

          <RoutineSection
            title="Weekly Routine"
            icon="📆"
            routines={weeklyRoutines}
            emptyMessage="No weekly routines set up. Click the + button to add your first weekly activity!"
          />
        </div>

        {/* Floating Add Button */}
        <FloatingButton
          onClick={() => {
            setEditingRoutine(undefined);
            setShowRoutineModal(true);
          }}
        />

        {/* Routine Modal */}
        <RoutineModal
          open={showRoutineModal}
          onOpenChange={setShowRoutineModal}
          onSave={handleSaveRoutine}
          routine={editingRoutine}
        />
      </div>
    </div>
  );
}
