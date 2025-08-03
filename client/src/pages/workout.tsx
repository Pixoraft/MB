import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart } from "@/components/charts/pie-chart";
import { FloatingButton } from "@/components/ui/floating-button";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { WorkoutModal } from "@/components/modals/workout-modal";
import { Exercise, InsertExercise } from "@shared/schema";
import { getTodayString, getCurrentDayName, calculatePerformance } from "@/lib/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Workout() {
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
  const [isWeeklyMode, setIsWeeklyMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState(getCurrentDayName());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = getTodayString();

  // Initialize 7-day workout routine
  const initializeWorkoutRoutine = useMutation({
    mutationFn: async () => {
      const workoutRoutines: InsertExercise[] = [
        // Day 1 – Push (Chest, Shoulders, Triceps, Abs)
        { name: "Normal Push-Ups", sets: 4, reps: "25", day: "monday", workoutType: "Push", isWeekly: true, date: today, completed: false },
        { name: "Incline Push-Ups", sets: 3, reps: "25", day: "monday", workoutType: "Push", isWeekly: true, date: today, completed: false },
        { name: "Pike Push-Ups", sets: 3, reps: "15", day: "monday", workoutType: "Push", isWeekly: true, date: today, completed: false },
        { name: "Diamond Push-Ups", sets: 2, reps: "15", day: "monday", workoutType: "Push", isWeekly: true, date: today, completed: false },
        { name: "Bench Dips", sets: 3, reps: "25", day: "monday", workoutType: "Push", isWeekly: true, date: today, completed: false },
        { name: "Russian Twists", sets: 3, reps: "30", day: "monday", workoutType: "Push", isWeekly: true, date: today, completed: false },
        { name: "Plank", sets: 1, reps: "5 min", day: "monday", workoutType: "Push", isWeekly: true, date: today, completed: false },

        // Day 2 – Pull (Back, Biceps, Forearms, Grip)
        { name: "Pull-Ups / Assisted", sets: 4, reps: "12", day: "tuesday", workoutType: "Pull", isWeekly: true, date: today, completed: false },
        { name: "Towel Rows", sets: 3, reps: "20", day: "tuesday", workoutType: "Pull", isWeekly: true, date: today, completed: false },
        { name: "Towel Bicep Curls", sets: 3, reps: "20", day: "tuesday", workoutType: "Pull", isWeekly: true, date: today, completed: false },
        { name: "Reverse Curls", sets: 3, reps: "15", day: "tuesday", workoutType: "Pull", isWeekly: true, date: today, completed: false },
        { name: "Gripper Fast", sets: 3, reps: "40", day: "tuesday", workoutType: "Pull", isWeekly: true, date: today, completed: false },
        { name: "Farmer Hold", sets: 2, reps: "45 sec", day: "tuesday", workoutType: "Pull", isWeekly: true, date: today, completed: false },
        { name: "Wrist Rolls", sets: 2, reps: "20", day: "tuesday", workoutType: "Pull", isWeekly: true, date: today, completed: false },

        // Day 3 – Legs (Quads, Glutes, Calves)
        { name: "Squats", sets: 4, reps: "25", day: "wednesday", workoutType: "Legs", isWeekly: true, date: today, completed: false },
        { name: "Jump Squats", sets: 3, reps: "20", day: "wednesday", workoutType: "Legs", isWeekly: true, date: today, completed: false },
        { name: "Lunges", sets: 3, reps: "20 steps", day: "wednesday", workoutType: "Legs", isWeekly: true, date: today, completed: false },
        { name: "Calf Raises", sets: 4, reps: "30", day: "wednesday", workoutType: "Legs", isWeekly: true, date: today, completed: false },
        { name: "Wall Sit", sets: 2, reps: "45 sec", day: "wednesday", workoutType: "Legs", isWeekly: true, date: today, completed: false },
        { name: "Broad Jumps", sets: 2, reps: "15", day: "wednesday", workoutType: "Legs", isWeekly: true, date: today, completed: false },
        { name: "High Knees", sets: 2, reps: "30", day: "wednesday", workoutType: "Legs", isWeekly: true, date: today, completed: false },

        // Day 4 – Core + Abs (Six-Pack, Obliques, Stability)
        { name: "Crunches", sets: 3, reps: "25", day: "thursday", workoutType: "Core", isWeekly: true, date: today, completed: false },
        { name: "Leg Raises", sets: 3, reps: "25", day: "thursday", workoutType: "Core", isWeekly: true, date: today, completed: false },
        { name: "Mountain Climbers", sets: 3, reps: "30", day: "thursday", workoutType: "Core", isWeekly: true, date: today, completed: false },
        { name: "Plank", sets: 3, reps: "1 min", day: "thursday", workoutType: "Core", isWeekly: true, date: today, completed: false },
        { name: "Side Plank", sets: 2, reps: "1 min each", day: "thursday", workoutType: "Core", isWeekly: true, date: today, completed: false },
        { name: "V-Ups", sets: 3, reps: "20", day: "thursday", workoutType: "Core", isWeekly: true, date: today, completed: false },
        { name: "Russian Twists", sets: 3, reps: "30", day: "thursday", workoutType: "Core", isWeekly: true, date: today, completed: false },

        // Day 5 – Power + Explosive + Grip Veins (Short, Strong)
        { name: "Clap Pushups", sets: 3, reps: "15", day: "friday", workoutType: "Power", isWeekly: true, date: today, completed: false },
        { name: "Skipping", sets: 1, reps: "5 min", day: "friday", workoutType: "Power", isWeekly: true, date: today, completed: false },
        { name: "High Knees", sets: 3, reps: "30", day: "friday", workoutType: "Power", isWeekly: true, date: today, completed: false },
        { name: "Towel Bicep Curls", sets: 2, reps: "25", day: "friday", workoutType: "Power", isWeekly: true, date: today, completed: false },
        { name: "Wrist Rolls", sets: 2, reps: "20", day: "friday", workoutType: "Power", isWeekly: true, date: today, completed: false },
        { name: "Gripper Slow Squeeze", sets: 2, reps: "15", day: "friday", workoutType: "Power", isWeekly: true, date: today, completed: false },
        { name: "Hanging", sets: 3, reps: "1 min", day: "friday", workoutType: "Power", isWeekly: true, date: today, completed: false },

        // Day 6 – BONUS Stretch + Pump Day (Light Sculpting + Relaxing)
        { name: "Archer Pushups", sets: 2, reps: "12", day: "saturday", workoutType: "Stretch", isWeekly: true, date: today, completed: false },
        { name: "Incline Pushups", sets: 2, reps: "20", day: "saturday", workoutType: "Stretch", isWeekly: true, date: today, completed: false },
        { name: "Squats", sets: 2, reps: "25", day: "saturday", workoutType: "Stretch", isWeekly: true, date: today, completed: false },
        { name: "Plank", sets: 2, reps: "1 min", day: "saturday", workoutType: "Stretch", isWeekly: true, date: today, completed: false },
        { name: "Neck + Spine + Toe Touch Stretch", sets: 3, reps: "30 sec", day: "saturday", workoutType: "Stretch", isWeekly: true, date: today, completed: false },
        { name: "Hanging", sets: 2, reps: "1 min", day: "saturday", workoutType: "Stretch", isWeekly: true, date: today, completed: false },

        // Day 7 – Rest Day (Optional Light Activities)
        { name: "Hanging", sets: 1, reps: "1 min", day: "sunday", workoutType: "Rest", isWeekly: true, date: today, completed: false },
        { name: "Cobra Stretch", sets: 2, reps: "30 sec", day: "sunday", workoutType: "Rest", isWeekly: true, date: today, completed: false },
        { name: "Light Walk", sets: 1, reps: "10 min", day: "sunday", workoutType: "Rest", isWeekly: true, date: today, completed: false },
      ];
      
      const promises = workoutRoutines.map(workout => 
        apiRequest("POST", "/api/exercises", workout)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({ title: "7-Day workout routine added successfully! 💪" });
    },
    onError: () => {
      toast({ title: "Failed to add workout routine", variant: "destructive" });
    },
  });

  // Fetch daily exercises
  const { data: dailyExercises = [] } = useQuery({
    queryKey: ["/api/exercises", today, false],
    queryFn: async () => {
      const response = await fetch(`/api/exercises?date=${today}&isWeekly=false`);
      return response.json();
    },
  });

  // Fetch weekly exercises
  const { data: weeklyExercises = [] } = useQuery({
    queryKey: ["/api/exercises", "weekly"],
    queryFn: async () => {
      const response = await fetch("/api/exercises?isWeekly=true");
      return response.json();
    },
  });

  // Initialize workout routine only once
  const [hasInitializedWorkout, setHasInitializedWorkout] = useState(false);
  
  useEffect(() => {
    // Only initialize if no weekly workouts exist and we haven't already initialized
    if (weeklyExercises.length === 0 && !hasInitializedWorkout && !initializeWorkoutRoutine.isPending) {
      setHasInitializedWorkout(true);
      initializeWorkoutRoutine.mutate();
    }
  }, [weeklyExercises.length, hasInitializedWorkout]);

  // Create exercise mutation
  const createExerciseMutation = useMutation({
    mutationFn: async (newExercise: InsertExercise) => {
      const response = await apiRequest("POST", "/api/exercises", newExercise);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({ title: "Exercise created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create exercise", variant: "destructive" });
    },
  });

  // Update exercise mutation
  const updateExerciseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Exercise> }) => {
      const response = await apiRequest("PATCH", `/api/exercises/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({ title: "Exercise updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update exercise", variant: "destructive" });
    },
  });

  // Delete exercise mutation
  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/exercises/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({ title: "Exercise deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete exercise", variant: "destructive" });
    },
  });

  // Calculate performance metrics
  const completedDailyExercises = dailyExercises.filter((ex: Exercise) => ex.completed).length;
  const dailyExercisePerformance = calculatePerformance(completedDailyExercises, dailyExercises.length);

  const completedWeeklyExercises = weeklyExercises.filter((ex: Exercise) => ex.completed).length;
  const weeklyProgressPerformance = calculatePerformance(completedWeeklyExercises, weeklyExercises.length);

  // Filter exercises by selected day for weekly view
  const selectedDayExercises = weeklyExercises.filter((ex: Exercise) => ex.day === selectedDay);
  const missedExercises = weeklyExercises.filter((ex: Exercise) => 
    ex.day !== getCurrentDayName() && !ex.completed
  );

  const handleExerciseToggle = (exercise: Exercise) => {
    updateExerciseMutation.mutate({
      id: exercise.id,
      updates: { completed: !exercise.completed }
    });
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setShowWorkoutModal(true);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (confirm("Are you sure you want to delete this exercise?")) {
      deleteExerciseMutation.mutate(exerciseId);
    }
  };

  const handleSaveExercise = (exerciseData: InsertExercise) => {
    if (editingExercise) {
      updateExerciseMutation.mutate({
        id: editingExercise.id,
        updates: exerciseData
      });
    } else {
      createExerciseMutation.mutate(exerciseData);
    }
    setEditingExercise(undefined);
  };

  const days = [
    { value: "sunday", label: "Sun" },
    { value: "monday", label: "Mon" },
    { value: "tuesday", label: "Tue" },
    { value: "wednesday", label: "Wed" },
    { value: "thursday", label: "Thu" },
    { value: "friday", label: "Fri" },
    { value: "saturday", label: "Sat" },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-black text-gradient-primary mb-4">Workout Tracker</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Track your daily and weekly workout progress with beautiful insights</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-6"></div>
        </div>

        {/* Workout Performance Chart */}
        <Card className="premium-card relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full"></div>
          <CardHeader>
            <CardTitle className="text-2xl text-gradient-primary">🏋️‍♂️ Workout Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <h4 className="text-lg font-bold text-gradient-primary mb-4">Daily Exercises</h4>
                <div className="relative">
                  <PieChart
                    data={[dailyExercisePerformance, 100 - dailyExercisePerformance]}
                    colors={['#F59E0B', '#E2E8F0']}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-3xl font-black text-gradient-secondary block">{dailyExercisePerformance}%</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Complete</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold text-gradient-primary mb-4">Weekly Progress</h4>
                <div className="relative">
                  <PieChart
                    data={[weeklyProgressPerformance, 100 - weeklyProgressPerformance]}
                    colors={['#22C55E', '#E2E8F0']}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-3xl font-black text-gradient-primary block">{weeklyProgressPerformance}%</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Complete</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workout Tabs */}
        <Card className="premium-card relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-full"></div>
          <Tabs defaultValue="daily" className="w-full">
            <div className="border-b border-gray-200/20 dark:border-gray-700/20">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-primary/5 to-accent/5 p-2 rounded-xl">
                <TabsTrigger value="daily" className="flex items-center space-x-2 premium-button text-lg font-semibold py-3">
                  <span>🟢</span>
                  <span>Daily Workout</span>
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex items-center space-x-2 premium-button text-lg font-semibold py-3">
                  <span>🔵</span>
                  <span>Weekly Workout</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Daily Workout Tab */}
            <TabsContent value="daily" className="p-8">
              {dailyExercises.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                    <span className="text-4xl">🏋️‍♂️</span>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">No exercises scheduled for today</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Click the + button to add your first exercise!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {dailyExercises.map((exercise: Exercise) => (
                    <div
                      key={exercise.id}
                      className="exercise-item premium-card p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-6 flex-1">
                          <Checkbox
                            checked={exercise.completed}
                            onCheckedChange={() => handleExerciseToggle(exercise)}
                            className="w-6 h-6 border-2 border-primary/30 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:to-accent"
                          />
                          <div className="flex-1">
                            <div className={`text-lg font-semibold ${exercise.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'} transition-colors`}>
                              {exercise.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                              💪 {exercise.sets} sets × {exercise.reps} • ⏱️ {exercise.duration} min
                            </div>
                          </div>
                        </div>
                        <ThreeDotMenu
                          onEdit={() => handleEditExercise(exercise)}
                          onDelete={() => handleDeleteExercise(exercise.id)}
                        />
                      </div>
                    </div>
                ))}
              </div>
            )}
          </TabsContent>

            {/* Weekly Workout Tab */}
            <TabsContent value="weekly" className="p-8">
              {/* Day Tabs */}
              <div className="border-b border-gray-200/20 dark:border-gray-700/20 mb-8">
                <div className="flex space-x-2 overflow-x-auto pb-4">
                  {days.map((day) => (
                    <Button
                      key={day.value}
                      variant={selectedDay === day.value ? "default" : "ghost"}
                      size="lg"
                      onClick={() => setSelectedDay(day.value)}
                      className={`flex-shrink-0 premium-button font-semibold px-6 py-3 ${
                        selectedDay === day.value 
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' 
                          : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10'
                      }`}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Weekly Exercises */}
              <div className="space-y-6 mb-12">
                {selectedDayExercises.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                      <span className="text-4xl">📅</span>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                      No exercises scheduled for {days.find(d => d.value === selectedDay)?.label}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Click the + button to add exercises!</p>
                  </div>
                ) : (
                  selectedDayExercises.map((exercise: Exercise) => (
                    <div
                      key={exercise.id}
                      className="exercise-item premium-card p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-6 flex-1">
                          <Checkbox
                            checked={exercise.completed}
                            onCheckedChange={() => handleExerciseToggle(exercise)}
                            disabled={selectedDay !== getCurrentDayName()}
                            className="w-6 h-6 border-2 border-primary/30 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:to-accent disabled:opacity-50"
                          />
                          <div className="flex-1">
                            <div className={`text-lg font-semibold ${exercise.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'} transition-colors`}>
                              {exercise.workoutType && (
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">{exercise.workoutType} - </span>
                              )}
                              {exercise.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                              💪 {exercise.sets} sets × {exercise.reps} • ⏱️ {exercise.duration} min
                            </div>
                          </div>
                        </div>
                        <ThreeDotMenu
                          onEdit={() => handleEditExercise(exercise)}
                          onDelete={() => handleDeleteExercise(exercise.id)}
                        />
                      </div>
                    </div>
                ))
              )}
            </div>

              {/* Missed Workouts Section */}
              {missedExercises.length > 0 && (
                <div className="border-t border-gray-200/20 dark:border-gray-700/20 pt-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">❌</span>
                    </div>
                    <h4 className="text-xl font-bold text-gradient-primary">Missed Workouts</h4>
                  </div>
                  <div className="space-y-4">
                    {missedExercises.map((exercise: Exercise) => (
                      <div
                        key={exercise.id}
                        className="premium-card p-6 border-l-4 border-red-500 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-900/20 dark:to-transparent"
                      >
                        <div className="text-gray-900 dark:text-white font-semibold text-lg">
                          📅 {days.find(d => d.value === exercise.day)?.label} - 
                          {exercise.workoutType && (
                            <span className="text-red-600 dark:text-red-400 font-bold">{exercise.workoutType}: </span>
                          )}
                          {exercise.name}
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400 font-medium mt-2">
                          ⚠️ Missed: {exercise.sets} sets × {exercise.reps} • {exercise.duration} min
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Floating Add Button */}
        <FloatingButton
          onClick={() => {
            setEditingExercise(undefined);
            setIsWeeklyMode(false);
            setShowWorkoutModal(true);
          }}
        />

        {/* Workout Modal */}
        <WorkoutModal
          open={showWorkoutModal}
          onOpenChange={setShowWorkoutModal}
          onSave={handleSaveExercise}
          exercise={editingExercise}
          isWeekly={isWeeklyMode}
        />
      </div>
    </div>
  );
}
