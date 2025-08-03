import { useState } from "react";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Workout Tracker</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Track your daily and weekly workout progress</p>
      </div>

      {/* Workout Performance Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>🏋️‍♂️ Workout Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-center mb-2">Daily Exercises</h4>
              <PieChart
                data={[dailyExercisePerformance, 100 - dailyExercisePerformance]}
                colors={['hsl(var(--accent))', 'hsl(var(--muted))']}
              />
              <div className="text-center mt-2">
                <span className="text-lg font-bold text-accent">{dailyExercisePerformance}%</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-center mb-2">Weekly Progress</h4>
              <PieChart
                data={[weeklyProgressPerformance, 100 - weeklyProgressPerformance]}
                colors={['hsl(var(--secondary))', 'hsl(var(--muted))']}
              />
              <div className="text-center mt-2">
                <span className="text-lg font-bold text-secondary">{weeklyProgressPerformance}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workout Tabs */}
      <Card>
        <Tabs defaultValue="daily" className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="daily" className="flex items-center space-x-2">
                <span>🟢</span>
                <span>Daily Workout</span>
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center space-x-2">
                <span>🔵</span>
                <span>Weekly Workout</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Daily Workout Tab */}
          <TabsContent value="daily" className="p-6">
            {dailyExercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No exercises scheduled for today. Click the + button to add your first exercise!
              </div>
            ) : (
              <div className="space-y-4">
                {dailyExercises.map((exercise: Exercise) => (
                  <div
                    key={exercise.id}
                    className="exercise-item flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <Checkbox
                        checked={exercise.completed}
                        onCheckedChange={() => handleExerciseToggle(exercise)}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className={`text-gray-900 dark:text-white font-medium ${exercise.completed ? 'line-through' : ''}`}>
                          {exercise.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {exercise.sets} sets × {exercise.reps} • {exercise.duration} min
                        </div>
                      </div>
                    </div>
                    <ThreeDotMenu
                      onEdit={() => handleEditExercise(exercise)}
                      onDelete={() => handleDeleteExercise(exercise.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Weekly Workout Tab */}
          <TabsContent value="weekly" className="p-6">
            {/* Day Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {days.map((day) => (
                  <Button
                    key={day.value}
                    variant={selectedDay === day.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedDay(day.value)}
                    className="flex-shrink-0"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Weekly Exercises */}
            <div className="space-y-4 mb-8">
              {selectedDayExercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No exercises scheduled for {days.find(d => d.value === selectedDay)?.label}. 
                  Click the + button to add exercises!
                </div>
              ) : (
                selectedDayExercises.map((exercise: Exercise) => (
                  <div
                    key={exercise.id}
                    className="exercise-item flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <Checkbox
                        checked={exercise.completed}
                        onCheckedChange={() => handleExerciseToggle(exercise)}
                        disabled={selectedDay !== getCurrentDayName()}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className={`text-gray-900 dark:text-white font-medium ${exercise.completed ? 'line-through' : ''}`}>
                          {exercise.workoutType && (
                            <span className="text-primary font-medium">{exercise.workoutType} - </span>
                          )}
                          {exercise.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {exercise.sets} sets × {exercise.reps} • {exercise.duration} min
                        </div>
                      </div>
                    </div>
                    <ThreeDotMenu
                      onEdit={() => handleEditExercise(exercise)}
                      onDelete={() => handleDeleteExercise(exercise.id)}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Missed Workouts Section */}
            {missedExercises.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">❌ Missed Workouts</h4>
                <div className="space-y-3">
                  {missedExercises.map((exercise: Exercise) => (
                    <div
                      key={exercise.id}
                      className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    >
                      <div className="text-gray-900 dark:text-white font-medium">
                        {days.find(d => d.value === exercise.day)?.label} - 
                        {exercise.workoutType && ` ${exercise.workoutType}:`} {exercise.name}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">
                        Missed: {exercise.sets} sets × {exercise.reps}
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
  );
}
