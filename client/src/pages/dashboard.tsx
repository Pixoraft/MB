import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/charts/pie-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { MonthlyCalendar } from "@/components/calendar/monthly-calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { getTodayString, calculatePerformance } from "@/lib/date-utils";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);

  // Fetch data for today
  const today = getTodayString();

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks", today],
    queryFn: async () => {
      const response = await fetch(`/api/tasks?date=${today}`);
      return response.json();
    },
  });

  const { data: dailyExercises = [] } = useQuery({
    queryKey: ["/api/exercises", today, false],
    queryFn: async () => {
      const response = await fetch(`/api/exercises?date=${today}&isWeekly=false`);
      return response.json();
    },
  });

  const { data: weeklyExercises = [] } = useQuery({
    queryKey: ["/api/exercises", "weekly"],
    queryFn: async () => {
      const response = await fetch("/api/exercises?isWeekly=true");
      return response.json();
    },
  });

  const { data: mindActivities = [] } = useQuery({
    queryKey: ["/api/mind-activities", today],
    queryFn: async () => {
      const response = await fetch(`/api/mind-activities?date=${today}`);
      return response.json();
    },
  });

  const { data: routineItems = [] } = useQuery({
    queryKey: ["/api/routine-items", today],
    queryFn: async () => {
      const response = await fetch(`/api/routine-items?date=${today}`);
      return response.json();
    },
  });

  const { data: weeklyGoals = [] } = useQuery({
    queryKey: ["/api/goals", "weekly"],
    queryFn: async () => {
      const response = await fetch("/api/goals?type=weekly");
      return response.json();
    },
  });

  const { data: monthlyGoals = [] } = useQuery({
    queryKey: ["/api/goals", "monthly"],
    queryFn: async () => {
      const response = await fetch("/api/goals?type=monthly");
      return response.json();
    },
  });

  const { data: yearlyGoals = [] } = useQuery({
    queryKey: ["/api/goals", "yearly"],
    queryFn: async () => {
      const response = await fetch("/api/goals?type=yearly");
      return response.json();
    },
  });

  const { data: streak = { current: 0, highest: 0 } } = useQuery({
    queryKey: ["/api/streak"],
    queryFn: async () => {
      const response = await fetch("/api/streak");
      return response.json();
    },
  });

  const { data: performanceData = [] } = useQuery({
    queryKey: ["/api/performance"],
    queryFn: async () => {
      const response = await fetch("/api/performance");
      return response.json();
    },
  });

  // Calculate today's performance
  const completedTasks = tasks.filter((task: any) => task.completed).length;
  const taskPerformance = calculatePerformance(completedTasks, tasks.length);

  // Combine daily and today's weekly exercises for workout performance
  const getCurrentDayName = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };
  
  const currentDayName = getCurrentDayName();
  const todayWeeklyExercises = weeklyExercises.filter((ex: any) => ex.day === currentDayName);
  const allTodayExercises = [...dailyExercises, ...todayWeeklyExercises];
  
  const completedExercises = allTodayExercises.filter((ex: any) => ex.completed).length;
  const workoutPerformance = calculatePerformance(completedExercises, allTodayExercises.length);

  // Handle mindset performance with default activities
  const getStoredMindActivityStates = () => {
    const stored = localStorage.getItem(`mindActivityStates_${today}`);
    return stored ? JSON.parse(stored) : {};
  };

  const defaultMindActivities = [
    { id: "default-1", name: "Morning Reflection & Goal Setting", time: "08:00", completed: false },
    { id: "default-2", name: "Creative Problem Solving Session", time: "11:00", completed: false },
    { id: "default-3", name: "Afternoon Mindfulness Break", time: "15:00", completed: false },
    { id: "default-4", name: "Learning & Skill Development", time: "18:00", completed: false },
    { id: "default-5", name: "Evening Reflection & Tomorrow Planning", time: "21:00", completed: false }
  ];

  const displayMindActivities = mindActivities.length > 0 ? mindActivities : 
    defaultMindActivities.map(activity => ({
      ...activity,
      completed: getStoredMindActivityStates()[activity.id] || false
    }));

  const completedMindActivities = displayMindActivities.filter((act: any) => act.completed).length;
  const mindPerformance = calculatePerformance(completedMindActivities, displayMindActivities.length);

  const completedRoutines = routineItems.filter((item: any) => item.completed).length;
  const routinePerformance = calculatePerformance(completedRoutines, routineItems.length);

  // Filter weekly goals for current week only
  const getCurrentWeekStart = () => {
    const today = new Date();
    const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    return currentWeekStart.toISOString().split('T')[0];
  };
  
  const getCurrentWeekEnd = () => {
    const today = new Date();
    const currentWeekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return currentWeekEnd.toISOString().split('T')[0];
  };

  const currentWeekStart = getCurrentWeekStart();
  const currentWeekEnd = getCurrentWeekEnd();
  
  const currentWeekGoals = weeklyGoals.filter((goal: any) => {
    const goalDate = goal.targetDate;
    return goalDate >= currentWeekStart && goalDate <= currentWeekEnd;
  });

  const completedWeeklyGoals = currentWeekGoals.filter((goal: any) => goal.completed).length;
  const devPerformance = calculatePerformance(completedWeeklyGoals, currentWeekGoals.length);

  const todayPerformanceData = [taskPerformance, workoutPerformance, mindPerformance, routinePerformance];
  const todayPerformanceLabels = ['Tasks', 'Workout', 'Mind', 'Routine'];

  // Generate sample weekly data (in real app, this would come from API)
  const weeklyData = [85, 78, 92, 85, 88, 76, 90];
  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Convert performance data for calendar
  const calendarPerformanceData = performanceData.reduce((acc: any, perf: any) => {
    acc[perf.date] = perf.overall;
    return acc;
  }, {});

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setShowPerformanceModal(true);
  };

  // Calculate totals for performance score calculation
  const totalTasks = tasks.length;
  const totalWorkouts = allTodayExercises.length;
  const completedWorkouts = completedExercises;
  const totalMindActivities = displayMindActivities.length;
  const totalRoutines = routineItems.length;
  const totalDevGoals = currentWeekGoals.length;
  const completedDevGoals = completedWeeklyGoals;

  // Helper function to calculate performance score for each category
  const getPerformanceScore = (category: string) => {
    switch (category) {
      case "Tasks":
        return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      case "Workout":
        return totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;
      case "Mind":
        return totalMindActivities > 0 ? Math.round((completedMindActivities / totalMindActivities) * 100) : 0;
      case "Routine":
        return totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;
      case "Dev":
        return totalDevGoals > 0 ? Math.round((completedDevGoals / totalDevGoals) * 100) : 0;
      default:
        return 0;
    }
  };

  const selectedDatePerformance = performanceData.find((p: any) => p.date === selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="page-title text-gradient-primary">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your overall progress and maintain your streaks</p>
        </div>

        {/* Top Section - Streaks and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Streak Cards */}
          <div className="card-clean">
            <h2 className="section-title flex items-center">
              🔥 Streak Tracking
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient-primary mb-2">{streak.current}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient-secondary mb-2">{streak.highest}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Highest Streak</div>
              </div>
            </div>
          </div>

          {/* Today's Performance */}
          <div className="card-clean">
            <h2 className="section-title">📊 Today's Performance</h2>
            <div className="grid grid-cols-5 gap-4">
              {["Tasks", "Workout", "Mind", "Routine", "Dev"].map((category, index) => {
                const percentage = getPerformanceScore(category);
                return (
                  <div key={category} className="text-center">
                    <div className="text-2xl font-bold text-gradient-primary mb-1">{percentage}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{category}</div>
                    <div className="progress-clean h-2 mt-2">
                      <div 
                        className="progress-fill h-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card-clean">
            <h2 className="section-title">Today's Progress</h2>
            <BarChart
              data={todayPerformanceData}
              labels={todayPerformanceLabels}
              colors={['#8B5DFF', '#22C55E', '#3B82F6', '#EF4444', '#F59E0B']}
            />
          </div>
          <div className="card-clean">
            <h2 className="section-title">Weekly Trend</h2>
            <BarChart
              data={weeklyData}
              labels={weeklyLabels}
              type="line"
              colors={['#8B5DFF']}
            />
          </div>
        </div>

        {/* Monthly Calendar */}
        <div className="mb-8">
          <MonthlyCalendar 
            performanceData={calendarPerformanceData}
            onDateClick={handleDateClick}
          />
        </div>

        {/* Development Progress */}
        <div className="card-clean">
          <h2 className="section-title">💻 Development Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Goal</span>
                <span className="text-sm font-semibold text-gradient-primary">{devPerformance}%</span>
              </div>
              <div className="progress-clean h-3">
                <div 
                  className="progress-fill h-full" 
                  style={{ width: `${devPerformance}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Goal</span>
                <span className="text-sm font-semibold text-gradient-secondary">67%</span>
              </div>
              <div className="progress-clean h-3">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600"
                  style={{ width: '67%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Yearly Goal</span>
                <span className="text-sm font-semibold text-blue-500">42%</span>
              </div>
              <div className="progress-clean h-3">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  style={{ width: '42%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Breakdown Modal */}
        <Dialog open={showPerformanceModal} onOpenChange={setShowPerformanceModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Performance Breakdown</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <h4 className="font-semibold">Performance for {selectedDate}</h4>
              {selectedDatePerformance ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tasks</span>
                    <span className="font-medium">{selectedDatePerformance.tasks}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Workout</span>
                    <span className="font-medium">{selectedDatePerformance.workout}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mind Workout</span>
                    <span className="font-medium">{selectedDatePerformance.mindWorkout}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Routine</span>
                    <span className="font-medium">{selectedDatePerformance.routine}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Development</span>
                    <span className="font-medium">{selectedDatePerformance.dev}%</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Overall</span>
                      <span>{selectedDatePerformance.overall}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No data available for this date.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
