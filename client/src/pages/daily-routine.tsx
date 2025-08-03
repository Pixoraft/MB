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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {icon} {title}
          <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
            ({routines.length} activities)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {routines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-3">
            {routines.map((routine: RoutineItem) => (
              <div
                key={routine.id}
                className="routine-item flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <Checkbox
                    checked={routine.completed}
                    onCheckedChange={() => handleRoutineToggle(routine)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className={`text-gray-900 dark:text-white font-medium ${routine.completed ? 'line-through' : ''}`}>
                      {routine.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                      <span>{routine.time}</span>
                      <span>•</span>
                      <span>{routine.duration} min</span>
                      {routine.days && routine.days.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex space-x-1">
                            {routine.days.map((day) => (
                              <Badge key={day} variant="outline" className="text-xs">
                                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={routine.completed ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                    {routine.completed ? "Done" : "Pending"}
                  </Badge>
                  <ThreeDotMenu
                    onEdit={() => handleEditRoutine(routine)}
                    onDelete={() => handleDeleteRoutine(routine.id)}
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Routine</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your morning, night, and weekly routines</p>
      </div>

      {/* Routine Completion Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>🔁 Routine Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <PieChart
              data={[overallCompletionRate, 100 - overallCompletionRate]}
              colors={['hsl(var(--destructive))', 'hsl(var(--muted))']}
            />
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{overallCompletionRate}%</div>
              <div className="text-gray-600 dark:text-gray-400">Overall Completion Rate</div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-green-500">{morningCompletionRate}%</div>
                  <div className="text-gray-600 dark:text-gray-400">Morning</div>
                </div>
                <div>
                  <div className="font-medium text-yellow-500">{nightCompletionRate}%</div>
                  <div className="text-gray-600 dark:text-gray-400">Night</div>
                </div>
                <div>
                  <div className="font-medium text-primary">{weeklyCompletionRate}%</div>
                  <div className="text-gray-600 dark:text-gray-400">Weekly</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Routine Sections */}
      <div className="space-y-8">
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
  );
}
