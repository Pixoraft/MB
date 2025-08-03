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

  const { data: exercises = [] } = useQuery({
    queryKey: ["/api/exercises", today],
    queryFn: async () => {
      const response = await fetch(`/api/exercises?date=${today}`);
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

  const completedExercises = exercises.filter((ex: any) => ex.completed).length;
  const workoutPerformance = calculatePerformance(completedExercises, exercises.length);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Track your overall progress and maintain your streaks</p>
      </div>

      {/* Top Section - Streaks and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Streak Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              🔥 Streak Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{streak.current}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{streak.highest}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Highest Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Performance */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Today's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={todayPerformanceData}
              labels={todayPerformanceLabels}
              colors={['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(142, 71%, 45%)']}
            />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Calendar */}
      <div className="mb-8">
        <MonthlyCalendar 
          performanceData={calendarPerformanceData}
          onDateClick={handleDateClick}
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Summary */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={weeklyData}
              labels={weeklyLabels}
              type="line"
              colors={['hsl(var(--primary))']}
            />
          </CardContent>
        </Card>

        {/* Dev Progress */}
        <Card>
          <CardHeader>
            <CardTitle>💻 Development Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Goal</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{devPerformance}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${devPerformance}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Goal</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">67%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: '67%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Yearly Goal</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">42%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '42%' }}></div>
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
  );
}
