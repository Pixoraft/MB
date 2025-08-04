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
import { getTodayString, getCurrentDayName, calculatePerformance, isCurrentDay } from "@/lib/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Workout() {
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
  const [isWeeklyMode, setIsWeeklyMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState(getCurrentDayName());
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>("Full Body");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = getTodayString();

  // Initialize 7-day Full Body workout routine
  const initializeFullBodyRoutine = useMutation({
    mutationFn: async () => {
      const workoutRoutines: InsertExercise[] = [
        // Day 1 – Push (Chest, Shoulders, Triceps, Abs)
        { name: "Normal Push-Ups", sets: 4, reps: "25", day: "monday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Incline Push-Ups", sets: 3, reps: "25", day: "monday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Pike Push-Ups", sets: 3, reps: "15", day: "monday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Diamond Push-Ups", sets: 2, reps: "15", day: "monday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Bench Dips", sets: 3, reps: "25", day: "monday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Russian Twists", sets: 3, reps: "30", day: "monday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Plank", sets: 1, reps: "5 min", day: "monday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },

        // Day 2 – Pull (Back, Biceps, Forearms, Grip)
        { name: "Pull-Ups / Assisted", sets: 4, reps: "12", day: "tuesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Towel Rows", sets: 3, reps: "20", day: "tuesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Towel Bicep Curls", sets: 3, reps: "20", day: "tuesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Reverse Curls", sets: 3, reps: "15", day: "tuesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Gripper Fast", sets: 3, reps: "40", day: "tuesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Farmer Hold", sets: 2, reps: "45 sec", day: "tuesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Wrist Rolls", sets: 2, reps: "20", day: "tuesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },

        // Day 3 – Legs (Quads, Glutes, Calves)
        { name: "Squats", sets: 4, reps: "25", day: "wednesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Jump Squats", sets: 3, reps: "20", day: "wednesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Lunges", sets: 3, reps: "20 steps", day: "wednesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Calf Raises", sets: 4, reps: "30", day: "wednesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Wall Sit", sets: 2, reps: "45 sec", day: "wednesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Broad Jumps", sets: 2, reps: "15", day: "wednesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "High Knees", sets: 2, reps: "30", day: "wednesday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },

        // Day 4 – Core + Abs (Six-Pack, Obliques, Stability)
        { name: "Crunches", sets: 3, reps: "25", day: "thursday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Leg Raises", sets: 3, reps: "25", day: "thursday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Mountain Climbers", sets: 3, reps: "30", day: "thursday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Plank", sets: 3, reps: "1 min", day: "thursday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Side Plank", sets: 2, reps: "1 min each", day: "thursday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "V-Ups", sets: 3, reps: "20", day: "thursday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Russian Twists", sets: 3, reps: "30", day: "thursday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },

        // Day 5 – Power + Explosive + Grip Veins (Short, Strong)
        { name: "Clap Pushups", sets: 3, reps: "15", day: "friday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Skipping", sets: 1, reps: "5 min", day: "friday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "High Knees", sets: 3, reps: "30", day: "friday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Towel Bicep Curls", sets: 2, reps: "25", day: "friday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Wrist Rolls", sets: 2, reps: "20", day: "friday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Gripper Slow Squeeze", sets: 2, reps: "15", day: "friday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Hanging", sets: 3, reps: "1 min", day: "friday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },

        // Day 6 – BONUS Stretch + Pump Day (Light Sculpting + Relaxing)
        { name: "Archer Pushups", sets: 2, reps: "12", day: "saturday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Incline Pushups", sets: 2, reps: "20", day: "saturday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Squats", sets: 2, reps: "25", day: "saturday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Plank", sets: 2, reps: "1 min", day: "saturday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Neck + Spine + Toe Touch Stretch", sets: 3, reps: "30 sec", day: "saturday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Hanging", sets: 2, reps: "1 min", day: "saturday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },

        // Day 7 – Rest Day (Optional Light Activities)
        { name: "Hanging", sets: 1, reps: "1 min", day: "sunday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Cobra Stretch", sets: 2, reps: "30 sec", day: "sunday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
        { name: "Light Walk", sets: 1, reps: "10 min", day: "sunday", workoutType: "Full Body", isWeekly: true, date: today, completed: false },
      ];
      
      const promises = workoutRoutines.map(workout => 
        apiRequest("POST", "/api/exercises", workout)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({ title: "Full Body workout routine added successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to add Full Body routine", variant: "destructive" });
    },
  });

  // Initialize Arms & Grip workout routine 
  const initializeArmsRoutine = useMutation({
    mutationFn: async () => {
      const armsRoutines: InsertExercise[] = [
        // Monday – High-Volume Gripper
        { name: "Gripper Fast Reps", sets: 4, reps: "50 each hand", day: "monday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Slow Squeeze Gripper", sets: 3, reps: "15 (3 sec hold)", day: "monday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Towel Twist", sets: 2, reps: "1 min", day: "monday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Wrist Rotations with Bottle", sets: 2, reps: "15", day: "monday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },

        // Tuesday – Strength + Static Hold
        { name: "Heavy Gripper", sets: 3, reps: "10 slow", day: "tuesday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Gripper Close-Hold", sets: 3, reps: "30 sec hold", day: "tuesday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Pinch Grip Hold", sets: 3, reps: "30 sec", day: "tuesday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Wrist Curl", sets: 3, reps: "15", day: "tuesday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Reverse Curl", sets: 3, reps: "15", day: "tuesday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Finger Wall Pushups", sets: 2, reps: "20 sec hold", day: "tuesday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },

        // Wednesday – Recovery + Light Pump
        { name: "Easy Gripper", sets: 2, reps: "30", day: "wednesday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Towel Squeeze Light", sets: 1, reps: "1 min", day: "wednesday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Wrist Mobility Circles", sets: 1, reps: "2 min", day: "wednesday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Finger Flex-Extend", sets: 1, reps: "50", day: "wednesday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },

        // Thursday – Mixed Monster Circuit
        { name: "Gripper Explosives", sets: 3, reps: "20", day: "thursday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Gripper Slow Hold", sets: 3, reps: "15", day: "thursday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Wrist Curl Circuit", sets: 3, reps: "15", day: "thursday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Reverse Curl Circuit", sets: 3, reps: "15", day: "thursday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Pinch Grip Circuit", sets: 3, reps: "30 sec", day: "thursday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Farmer Carry", sets: 3, reps: "1 min walk", day: "thursday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Towel Twists Finish", sets: 2, reps: "1 min", day: "thursday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },

        // Friday – Reverse Focus
        { name: "Rubber Band Finger Opens", sets: 3, reps: "20", day: "friday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Wall Finger Push", sets: 3, reps: "15", day: "friday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Reverse Wrist Curl", sets: 3, reps: "20", day: "friday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Forearm Extensor Stretch", sets: 1, reps: "1 min each arm", day: "friday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Light Gripper Recovery", sets: 2, reps: "20", day: "friday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },

        // Saturday – Max Test & Burnout
        { name: "Gripper Max Reps Test", sets: 1, reps: "to failure", day: "saturday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Close & Hold Max", sets: 1, reps: "45 sec", day: "saturday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Farmer's Hold Max", sets: 1, reps: "1 min", day: "saturday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Pinch Hold Max", sets: 1, reps: "45 sec", day: "saturday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Bucket Walk", sets: 2, reps: "10 steps", day: "saturday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Gripper Burnout", sets: 1, reps: "to failure", day: "saturday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },

        // Sunday – Rest/Recovery
        { name: "Light Hand Circles", sets: 1, reps: "2 min", day: "sunday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
        { name: "Forearm Stretch", sets: 1, reps: "3 min", day: "sunday", workoutType: "Arms & Grip", isWeekly: true, date: today, completed: false },
      ];
      
      const promises = armsRoutines.map(workout => 
        apiRequest("POST", "/api/exercises", workout)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({ title: "Arms & Grip workout routine added successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to add Arms routine", variant: "destructive" });
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

  // Initialize workout routines only once
  const [hasInitializedFullBody, setHasInitializedFullBody] = useState(false);
  const [hasInitializedArms, setHasInitializedArms] = useState(false);
  
  useEffect(() => {
    // Only initialize if no weekly workouts exist and we haven't already initialized
    const fullBodyWorkouts = weeklyExercises.filter((ex: Exercise) => ex.workoutType === "Full Body");
    const armsWorkouts = weeklyExercises.filter((ex: Exercise) => ex.workoutType === "Arms & Grip");
    
    if (fullBodyWorkouts.length === 0 && !hasInitializedFullBody && !initializeFullBodyRoutine.isPending) {
      setHasInitializedFullBody(true);
      initializeFullBodyRoutine.mutate();
    }
    
    if (armsWorkouts.length === 0 && !hasInitializedArms && !initializeArmsRoutine.isPending) {
      setHasInitializedArms(true);
      initializeArmsRoutine.mutate();
    }
  }, [weeklyExercises.length, hasInitializedFullBody, hasInitializedArms]);

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

  // Filter weekly exercises for today only
  const currentDayName = getCurrentDayName();
  const todayWeeklyExercises = weeklyExercises.filter((ex: Exercise) => ex.day === currentDayName);
  const completedTodayWeeklyExercises = todayWeeklyExercises.filter((ex: Exercise) => ex.completed).length;
  const weeklyProgressPerformance = calculatePerformance(completedTodayWeeklyExercises, todayWeeklyExercises.length);

  // Filter exercises by selected day and workout type for weekly view
  const selectedDayExercises = weeklyExercises.filter((ex: Exercise) => 
    ex.day === selectedDay && ex.workoutType === selectedWorkoutType
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gradient-primary mb-2 sm:mb-4">Workout Tracker</h2>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">Track your daily and weekly workout progress with beautiful insights</p>
          <div className="w-16 sm:w-20 lg:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-3 sm:mt-6"></div>
        </div>

        {/* Workout Performance Chart */}
        <Card className="premium-card relative overflow-hidden mb-6 sm:mb-8 lg:mb-12">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full"></div>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gradient-primary">🏋️‍♂️ Workout Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <div className="text-center">
                <h4 className="text-sm sm:text-base lg:text-lg font-bold text-gradient-primary mb-2 sm:mb-3 lg:mb-4">Daily Exercises</h4>
                <div className="relative h-32 sm:h-48 lg:h-64">
                  <PieChart
                    data={[dailyExercisePerformance, 100 - dailyExercisePerformance]}
                    colors={['#F59E0B', '#E2E8F0']}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-lg sm:text-2xl lg:text-3xl font-black text-gradient-secondary block">{dailyExercisePerformance}%</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Complete</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-sm sm:text-base lg:text-lg font-bold text-gradient-primary mb-2 sm:mb-3 lg:mb-4">Weekly Progress</h4>
                <div className="relative h-32 sm:h-48 lg:h-64">
                  <PieChart
                    data={[weeklyProgressPerformance, 100 - weeklyProgressPerformance]}
                    colors={['#22C55E', '#E2E8F0']}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-lg sm:text-2xl lg:text-3xl font-black text-gradient-primary block">{weeklyProgressPerformance}%</span>
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
              {/* Daily Workout Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Full Body Daily Workouts */}
                <Card className="premium-card">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">💪</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Full Body Daily</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Today's routine</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {dailyExercises.filter((ex: Exercise) => ex.workoutType === "Full Body").length === 0 ? (
                        <p className="text-sm text-gray-500">No Full Body exercises today</p>
                      ) : (
                        dailyExercises.filter((ex: Exercise) => ex.workoutType === "Full Body").map((exercise: Exercise) => (
                          <div key={exercise.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Checkbox
                              checked={exercise.completed}
                              onCheckedChange={() => handleExerciseToggle(exercise)}
                              className="w-5 h-5"
                            />
                            <div className="flex-1">
                              <div className={`font-medium ${exercise.completed ? 'line-through text-gray-500' : ''}`}>
                                {exercise.name}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {exercise.sets} sets × {exercise.reps}
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
                  </CardContent>
                </Card>

                {/* Arms & Grip Daily Workouts */}
                <Card className="premium-card">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">💥</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Arms & Grip Daily</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Today's routine</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {dailyExercises.filter((ex: Exercise) => ex.workoutType === "Arms & Grip").length === 0 ? (
                        <p className="text-sm text-gray-500">No Arms & Grip exercises today</p>
                      ) : (
                        dailyExercises.filter((ex: Exercise) => ex.workoutType === "Arms & Grip").map((exercise: Exercise) => (
                          <div key={exercise.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Checkbox
                              checked={exercise.completed}
                              onCheckedChange={() => handleExerciseToggle(exercise)}
                              className="w-5 h-5"
                            />
                            <div className="flex-1">
                              <div className={`font-medium ${exercise.completed ? 'line-through text-gray-500' : ''}`}>
                                {exercise.name}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {exercise.sets} sets × {exercise.reps}
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
                  </CardContent>
                </Card>
              </div>

              {/* Other Daily Exercises */}
              {dailyExercises.filter((ex: Exercise) => !ex.workoutType || (ex.workoutType !== "Full Body" && ex.workoutType !== "Arms & Grip")).length > 0 && (
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>Other Daily Exercises</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dailyExercises.filter((ex: Exercise) => !ex.workoutType || (ex.workoutType !== "Full Body" && ex.workoutType !== "Arms & Grip")).map((exercise: Exercise) => (
                        <div
                          key={exercise.id}
                          className="exercise-item premium-card p-4 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <Checkbox
                                checked={exercise.completed}
                                onCheckedChange={() => handleExerciseToggle(exercise)}
                                className="w-5 h-5"
                              />
                              <div className="flex-1">
                                <div className={`font-semibold ${exercise.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                  {exercise.name}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
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
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Weekly Workout Tab */}
            <TabsContent value="weekly" className="p-8">
              {/* Workout Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Full Body Workout Box */}
                <Card className="premium-card cursor-pointer hover:shadow-lg transition-all duration-300 group" 
                      onClick={() => setSelectedWorkoutType("Full Body")}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                          <span className="text-white text-xl">💪</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Full Body</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Complete 7-day routine</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        selectedWorkoutType === "Full Body" 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedWorkoutType === "Full Body" && (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completed:</span>
                        <span className="font-semibold">{weeklyExercises.filter((ex: Exercise) => ex.workoutType === "Full Body" && ex.completed).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total:</span>
                        <span className="font-semibold">{weeklyExercises.filter((ex: Exercise) => ex.workoutType === "Full Body").length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Arms & Grip Workout Box */}
                <Card className="premium-card cursor-pointer hover:shadow-lg transition-all duration-300 group" 
                      onClick={() => setSelectedWorkoutType("Arms & Grip")}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <span className="text-white text-xl">💥</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Arms & Grip</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">30-day forearm focus</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        selectedWorkoutType === "Arms & Grip" 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedWorkoutType === "Arms & Grip" && (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completed:</span>
                        <span className="font-semibold">{weeklyExercises.filter((ex: Exercise) => ex.workoutType === "Arms & Grip" && ex.completed).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total:</span>
                        <span className="font-semibold">{weeklyExercises.filter((ex: Exercise) => ex.workoutType === "Arms & Grip").length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Day Tabs */}
              {selectedWorkoutType && (
                <div className="border-b border-gray-200/20 dark:border-gray-700/20 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">
                      {selectedWorkoutType} - Weekly Schedule
                    </h3>
                  </div>
                  <div className="flex space-x-2 overflow-x-auto pb-4">
                    {days.map((day) => {
                      const isToday = isCurrentDay(day.value);
                      const isSelected = selectedDay === day.value;
                      
                      return (
                        <Button
                          key={day.value}
                          variant={isSelected ? "default" : "ghost"}
                          size="lg"
                          onClick={() => setSelectedDay(day.value)}
                          className={`flex-shrink-0 premium-button font-semibold px-6 py-3 relative ${
                            isSelected 
                              ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' 
                              : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10'
                          } ${
                            isToday && !isSelected 
                              ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-background' 
                              : ''
                          }`}
                        >
                          {day.label}
                          {isToday && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-background"></span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Weekly Exercises */}
              {selectedWorkoutType && (
                <div className="space-y-6 mb-12">
                  {selectedDayExercises.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                        <span className="text-4xl">📅</span>
                      </div>
                      <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                        No {selectedWorkoutType} exercises for {days.find(d => d.value === selectedDay)?.label}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Switch workout type or add new exercises!</p>
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
