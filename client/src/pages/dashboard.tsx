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

  const completedMindActivities = mindActivities.filter((act: any) => act.completed).length;
  const mindPerformance = calculatePerformance(completedMindActivities, mindActivities.length);

  const completedRoutines = routineItems.filter((item: any) => item.completed).length;
  const routinePerformance = calculatePerformance(completedRoutines, routineItems.length);

  const completedWeeklyGoals = weeklyGoals.filter((goal: any) => goal.completed).length;
  const devPerformance = calculatePerformance(completedWeeklyGoals, weeklyGoals.length);

  const todayPerformanceData = [taskPerformance, workoutPerformance, mindPerformance, routinePerformance, devPerformance];
  const todayPerformanceLabels = ['Tasks', 'Workout', 'Mind', 'Routine', 'Dev'];

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

  const selectedDatePerformance = performanceData.find((p: any) => p.date === selectedDate);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-black text-gradient-primary mb-4">Dashboard</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Track your overall progress and maintain your streaks with beautiful insights</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-6"></div>
        </div>

        {/* Top Section - Streaks and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Streak Cards */}
          <Card className="premium-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gradient-primary">
                🔥 Streak Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center relative">
                  <div className="text-4xl font-black text-gradient-primary mb-2">{streak.current}</div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</div>
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
                </div>
                <div className="text-center relative">
                  <div className="text-4xl font-black text-gradient-secondary mb-2">{streak.highest}</div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Highest Streak</div>
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-secondary to-accent rounded-full animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Performance */}
          <Card className="premium-card relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-br-full"></div>
            <CardHeader>
              <CardTitle className="text-2xl text-gradient-primary">📊 Today's Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={todayPerformanceData}
                labels={todayPerformanceLabels}
                colors={['#8B5DFF', '#22C55E', '#3B82F6', '#EF4444', '#F59E0B']}
              />
            </CardContent>
          </Card>
        </div>

        {/* Monthly Calendar */}
        <div className="mb-12">
          <MonthlyCalendar 
            performanceData={calendarPerformanceData}
            onDateClick={handleDateClick}
          />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Summary */}
          <Card className="premium-card relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-full"></div>
            <CardHeader>
              <CardTitle className="text-2xl text-gradient-primary">📈 Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={weeklyData}
                labels={weeklyLabels}
                type="line"
                colors={['#8B5DFF']}
              />
            </CardContent>
          </Card>

          {/* Dev Progress */}
          <Card className="premium-card relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/10 to-transparent rounded-tr-full"></div>
            <CardHeader>
              <CardTitle className="text-2xl text-gradient-primary">💻 Development Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Weekly Goal</span>
                    <span className="text-sm font-bold text-gradient-primary">{devPerformance}%</span>
                  </div>
                  <div className="progress-bar h-3">
                    <div 
                      className="progress-fill h-full rounded-full" 
                      style={{ width: `${devPerformance}%` }}
                    ></div>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Monthly Goal</span>
                    <span className="text-sm font-bold text-gradient-secondary">67%</span>
                  </div>
                  <div className="progress-bar h-3">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: '67%',
                        background: 'linear-gradient(90deg, #F59E0B, #EAB308)'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Yearly Goal</span>
                    <span className="text-sm font-bold text-blue-500">42%</span>
                  </div>
                  <div className="progress-bar h-3">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: '42%',
                        background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
