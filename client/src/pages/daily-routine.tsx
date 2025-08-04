import { useState, useEffect } from "react";
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

  // Get current day for weekly filtering
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  const { data: allWeeklyRoutines = [] } = useQuery({
    queryKey: ["/api/routine-items", "weekly"],
    queryFn: async () => {
      const response = await fetch("/api/routine-items?type=weekly");
      return response.json();
    },
  });
  
  // Filter weekly routines to show only current day tasks
  const weeklyRoutines = allWeeklyRoutines.filter((r: RoutineItem) => 
    r.days && r.days.includes(currentDay as any)
  );

  // Initialize skincare routine
  const initializeSkincareRoutine = useMutation({
    mutationFn: async () => {
      const skincareRoutines: InsertRoutineItem[] = [
        // Morning Skincare Routine
        { name: "🍋 Lemon & Honey Detox Drink", time: "06:00", duration: 5, type: "morning", date: today, completed: false },
        { name: "🧊 Ice Cube Face Treatment", time: "06:05", duration: 2, type: "morning", date: today, completed: false },
        { name: "🧼 Face & Body Wash (Vitamin C)", time: "06:10", duration: 5, type: "morning", date: today, completed: false },
        { name: "🍯 Malai + Honey + Haldi Face Pack", time: "06:15", duration: 20, type: "morning", date: today, completed: false },
        { name: "☀️ Moisturize & Sun Protection", time: "06:35", duration: 3, type: "morning", date: today, completed: false },
        
        // Evening Skincare Routine  
        { name: "🧼 Evening Face & Body Cleansing", time: "20:00", duration: 5, type: "night", date: today, completed: false },
        { name: "💧 Face Serum (Vitamin C/Niacinamide)", time: "20:05", duration: 2, type: "night", date: today, completed: false },
        { name: "🌙 Night Moisturizer", time: "20:10", duration: 2, type: "night", date: today, completed: false },
        { name: "🥛 Milk & Potato Dark Spot Treatment", time: "20:15", duration: 20, type: "night", date: today, completed: false },
        
        // Weekly Routines
        { name: "👄 Lip Scrub (Honey + Sugar)", time: "19:00", duration: 5, type: "weekly", days: ["tuesday", "thursday", "saturday"], date: today, completed: false },
        { name: "🧽 Body Exfoliation (Coffee + Curd)", time: "19:30", duration: 10, type: "weekly", days: ["sunday", "wednesday", "friday"], date: today, completed: false },
        { name: "🌿 Ubtan Body Mask", time: "18:00", duration: 35, type: "weekly", days: ["tuesday", "thursday", "saturday"], date: today, completed: false },
        { name: "🍋 Lemon & Baking Soda Treatment", time: "19:00", duration: 8, type: "weekly", days: ["monday", "friday"], date: today, completed: false },
        { name: "💆‍♀️ Hair Oil Massage", time: "17:00", duration: 70, type: "weekly", days: ["wednesday", "saturday"], date: today, completed: false },
        { name: "🧴 Hair Wash (Sulfate-Free)", time: "18:30", duration: 15, type: "weekly", days: ["wednesday", "saturday"], date: today, completed: false },
      ];
      
      const promises = skincareRoutines.map(routine => 
        apiRequest("POST", "/api/routine-items", routine)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routine-items"] });
      toast({ title: "Skincare routine added to your daily routine!" });
    },
    onError: () => {
      toast({ title: "Failed to add skincare routine", variant: "destructive" });
    },
  });

  // Note: Server-side initialization now handles sample data, so client-side initialization is disabled

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
                className="routine-item premium-card p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6 relative z-10">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 w-full">
                    <Checkbox
                      checked={routine.completed}
                      onCheckedChange={() => handleRoutineToggle(routine)}
                      className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary/30 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:to-accent mt-1 sm:mt-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm sm:text-base lg:text-lg font-semibold ${routine.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'} transition-colors mb-1 sm:mb-2`}>
                        {routine.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <span className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary dark:text-accent px-2 py-1 rounded-lg font-bold">
                          ⏰ {routine.time}
                        </span>
                        <span className="bg-gradient-to-r from-secondary/20 to-accent/20 text-secondary dark:text-accent px-2 py-1 rounded-lg font-bold">
                          ⏱️ {routine.duration} min
                        </span>
                        {routine.days && routine.days.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {routine.days.map((day) => (
                              <Badge key={day} className="bg-gradient-to-r from-gray-500 to-slate-600 text-white text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1">
                                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-center">
                    <Badge className={routine.completed 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg border-0 font-semibold px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs sm:text-sm" 
                      : "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg border-0 font-semibold px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs sm:text-sm"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">Daily Routine</h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
            Manage your morning, night, and weekly routines including skincare, haircare & hygiene
          </p>
        </div>

        {/* Skincare & Diet Tips Section */}
        <Card className="premium-card mb-6 sm:mb-8 lg:mb-12">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-semibold flex items-center space-x-2 sm:space-x-3">
              <span className="text-xl sm:text-2xl">✨</span>
              <span>Skincare & Health Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Diet Tips */}
              <div className="space-y-4">
                <h4 className="font-semibold text-green-600 dark:text-green-400 text-lg">🥗 Foods for Glowing Skin & Strong Hair</h4>
                <div className="space-y-3 text-sm">
                  <div><strong>Vitamin C:</strong> Orange, Lemon, Amla, Papaya, Tomato</div>
                  <div><strong>Carotene:</strong> Carrots, Spinach, Sweet Potatoes</div>
                  <div><strong>Collagen:</strong> Almonds, Walnuts, Coconut Water, Cucumber</div>
                  <div><strong>Iron & Biotin:</strong> Spinach, Almonds, Walnuts, Eggs</div>
                  <div><strong>Hydration:</strong> 3-4 liters of water daily</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    💪 Daily Hair Drink: Amla Juice or Coconut Water every morning
                  </p>
                </div>
              </div>

              {/* What to Avoid */}
              <div className="space-y-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400 text-lg">❌ Avoid These</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Too much sugar & junk food (causes dull skin & hair fall)</p>
                  <p>• Oily & fried food (clogs pores & weakens hair roots)</p>
                  <p>• Excess caffeine - Switch to Green Tea instead</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    🔥 Expected Results: 2-4 weeks for glowing skin, no tan, fresh smell, thick hair
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routine Completion Chart */}
        <Card className="premium-card relative overflow-hidden mb-6 sm:mb-8 lg:mb-12">
          <div className="absolute top-0 left-0 w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-accent/10 to-transparent rounded-br-full"></div>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gradient-primary">🔁 Routine Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
              <div className="text-center">
                <div className="relative w-full max-w-[200px] mx-auto aspect-square">
                  <PieChart
                    data={[overallCompletionRate, 100 - overallCompletionRate]}
                    colors={['#EF4444', '#E2E8F0']}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-lg sm:text-2xl lg:text-3xl font-black text-gradient-primary block">{overallCompletionRate}%</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Complete</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient-secondary mb-3 sm:mb-4">{overallCompletionRate}%</div>
                <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">Overall Completion Rate</div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                  <div className="premium-card p-2 sm:p-3 lg:p-4">
                    <div className="text-lg sm:text-xl lg:text-2xl font-black text-gradient-primary mb-1">{morningCompletionRate}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">☀️ Morning</div>
                  </div>
                  <div className="premium-card p-2 sm:p-3 lg:p-4">
                    <div className="text-lg sm:text-xl lg:text-2xl font-black text-gradient-secondary mb-1">{nightCompletionRate}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">🌙 Night</div>
                  </div>
                  <div className="premium-card p-2 sm:p-3 lg:p-4">
                    <div className="text-lg sm:text-xl lg:text-2xl font-black text-gradient-primary mb-1">{weeklyCompletionRate}%</div>
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
