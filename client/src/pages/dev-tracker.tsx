import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FloatingButton } from "@/components/ui/floating-button";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { GoalModal } from "@/components/modals/goal-modal";
import { Goal, InsertGoal } from "@shared/schema";
import { calculatePerformance } from "@/lib/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function DevTracker() {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch goals by type
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

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (newGoal: InsertGoal) => {
      const response = await apiRequest("POST", "/api/goals", newGoal);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
      const response = await apiRequest("PATCH", `/api/goals/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update goal", variant: "destructive" });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete goal", variant: "destructive" });
    },
  });

  // Initialize development goals based on your roadmap
  const initializeDevGoals = useMutation({
    mutationFn: async () => {
      const getWeekStart = (weeksFromNow: number) => {
        const today = new Date();
        const thisWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const weekStart = new Date(thisWeekStart);
        weekStart.setDate(thisWeekStart.getDate() + (weeksFromNow * 7));
        return weekStart.toISOString().split('T')[0];
      };

      const getMonthEnd = (monthsFromNow: number) => {
        const today = new Date();
        // For April (0), May (1), June (2), July (3), August (4)
        // We want to get the end of the target month, not months from today
        const baseMonth = 3; // April is month 3 (0-indexed)
        const targetMonth = new Date(2025, baseMonth + monthsFromNow + 1, 0);
        return targetMonth.toISOString().split('T')[0];
      };

      const devGoals: InsertGoal[] = [
        // Yearly Goals (2025-2030 Roadmap)
        {
          title: "2025: Hit ₹60K/month as Full-Stack Developer",
          description: "Master HTML, CSS, JS, React, Node.js, MongoDB. Build real-world projects, GitHub presence, freelance ₹60K-₹1L/month",
          type: "yearly",
          targetDate: "2025-12-31",
          completed: false,
          progress: 0,
        },
        {
          title: "2026: ₹1L-₹2L/month Income + Recognition",
          description: "TypeScript, Next.js, PostgreSQL, GraphQL, Docker. Freelance portfolio, paid SaaS, weekly content, open source contributions",
          type: "yearly",
          targetDate: "2026-12-31",
          completed: false,
          progress: 0,
        },
        {
          title: "2027: 6-Figure Year (₹1 Cr Club)",
          description: "Break ₹8L-₹10L/month via remote job, micro-SaaS, or freelancing+YouTube. 20K+ GitHub stars, 50K+ audience",
          type: "yearly",
          targetDate: "2027-12-31",
          completed: false,
          progress: 0,
        },

        // Monthly Goals for 2025
        {
          title: "April 2025 - Foundation & Setup",
          description: "Master JavaScript (promises, async/await, array methods), Learn React.js basics to hooks, Start Node.js + Express, Build portfolio, Setup GitHub/LinkedIn/resume",
          type: "monthly",
          targetDate: getMonthEnd(0),
          completed: false,
          progress: 0,
        },
        {
          title: "May 2025 - Full Stack Fundamentals", 
          description: "Deep dive React + Express.js, Learn MongoDB with Mongoose, Build 2 full-stack projects, Start blogs + LinkedIn posts, Master Postman + Git",
          type: "monthly",
          targetDate: getMonthEnd(1),
          completed: false,
          progress: 0,
        },
        {
          title: "June 2025 - Real World Projects",
          description: "Make 2 major real-world projects, Use JWT authentication, Role-based dashboards (Admin/User), Host on Vercel/Render, Start Upwork/Freelancer profiles",
          type: "monthly",
          targetDate: getMonthEnd(2),
          completed: false,
          progress: 0,
        },
        {
          title: "July 2025 - Freelancing + Interviews",
          description: "Get small freelance gigs (₹2-10k), Apply to internships, Practice coding interviews (DSA), Create payment project (Razorpay), Start cold emailing startups",
          type: "monthly",
          targetDate: getMonthEnd(3),
          completed: false,
          progress: 0,
        },
        {
          title: "August 2025 - Advanced Development & Job Search",
          description: "Master advanced React concepts, Build complex full-stack projects, Start applying to jobs, Get first paid freelance project, Improve DSA skills",
          type: "monthly",
          targetDate: getMonthEnd(4),
          completed: false,
          progress: 0,
        },

        // August 2025 Weekly Goals (Current Month)
        {
          title: "Week 1: Advanced JavaScript Mastery",
          description: "3 Days: Deep dive promises, async/await, array methods, closures. 2 Days: Build calculator + todo app. 1 Day: GitHub pushes + LinkedIn post. 1 Day: Practice DSA problems.",
          type: "weekly",
          targetDate: getWeekStart(0),
          completed: false,
          progress: 0,
        },
        {
          title: "Week 2: React.js Foundation",
          description: "3 Days: Components, props, state, hooks, event handling. 2 Days: Build weather app + portfolio site. 1 Day: Deploy to Vercel + write blog. 1 Day: Review + UI/UX study.",
          type: "weekly", 
          targetDate: getWeekStart(1),
          completed: false,
          progress: 0,
        },
        {
          title: "Week 3: Node.js & Backend Setup", 
          description: "3 Days: Node.js, Express, middleware, routing. 2 Days: Build REST API with CRUD operations. 1 Day: Connect to MongoDB + test with Postman. 1 Day: Git workflow practice.",
          type: "weekly",
          targetDate: getWeekStart(2),
          completed: false,
          progress: 0,
        },
        {
          title: "Week 4: Full-Stack Integration",
          description: "3 Days: Connect React frontend to Node backend. 2 Days: Add authentication (JWT), user registration/login. 1 Day: Deploy full-stack app. 1 Day: Portfolio update + networking.",
          type: "weekly",
          targetDate: getWeekStart(3),
          completed: false,
          progress: 0,
        },
        {
          title: "Week 4: Portfolio Website",
          description: "Build personal portfolio with React. Deploy on Vercel. Setup GitHub profile.",
          type: "weekly",
          targetDate: getWeekStart(3),
          completed: false,
          progress: 0,
        },

        // Next Month Weekly Goals (May 2025)
        {
          title: "Week 5: React Hooks & State",
          description: "Master useState, useEffect, custom hooks. Build 2 interactive apps.",
          type: "weekly",
          targetDate: getWeekStart(4),
          completed: false,
          progress: 0,
        },
        {
          title: "Week 6: Backend + Database",
          description: "Learn MongoDB, Mongoose. Build full-stack app with database connection.",
          type: "weekly",
          targetDate: getWeekStart(5),
          completed: false,
          progress: 0,
        },
        {
          title: "Week 7: Authentication System",
          description: "Implement JWT auth, user login/signup. Add role-based access control.",
          type: "weekly",
          targetDate: getWeekStart(6),
          completed: false,
          progress: 0,
        },
        {
          title: "Week 8: First Full-Stack Project",
          description: "Build complete task management app. Deploy frontend and backend.",
          type: "weekly",
          targetDate: getWeekStart(7),
          completed: false,
          progress: 0,
        },

        // June 2025 Goals
        {
          title: "Week 9: E-commerce Project Start",
          description: "Plan and start building e-commerce site. Setup product catalog and cart.",
          type: "weekly",
          targetDate: getWeekStart(8),
          completed: false,
          progress: 0,
        },
        {
          title: "Week 10: Payment Integration",
          description: "Add Razorpay payment gateway. Implement order management system.",
          type: "weekly",
          targetDate: getWeekStart(9),
          completed: false,
          progress: 0,
        },
        {
          title: "Week 11: Admin Dashboard",
          description: "Build admin panel with charts, user management, order tracking.",
          type: "weekly",
          targetDate: getWeekStart(10),
          completed: false,
          progress: 0,
        },
        {
          title: "Week 12: Freelance Platform Setup",
          description: "Create Upwork/Freelancer profiles. Apply to 10 small projects. Start networking.",
          type: "weekly",
          targetDate: getWeekStart(11),
          completed: false,
          progress: 0,
        },
      ];

      const promises = devGoals.map(goal => 
        apiRequest("POST", "/api/goals", goal)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Development roadmap goals added successfully! 🚀" });
    },
    onError: () => {
      toast({ title: "Failed to initialize goals", variant: "destructive" });
    },
  });

  // Clear duplicate goals mutation
  const clearDuplicateGoals = useMutation({
    mutationFn: async () => {
      // Get all goals first
      const weeklyResponse = await fetch("/api/goals?type=weekly");
      const monthlyResponse = await fetch("/api/goals?type=monthly");
      const yearlyResponse = await fetch("/api/goals?type=yearly");
      
      const allWeeklyGoals = await weeklyResponse.json();
      const allMonthlyGoals = await monthlyResponse.json();
      const allYearlyGoals = await yearlyResponse.json();
      
      const allGoals = [...allWeeklyGoals, ...allMonthlyGoals, ...allYearlyGoals];
      
      // Find duplicates by title
      const titleCounts: Record<string, Goal[]> = {};
      allGoals.forEach((goal: Goal) => {
        if (!titleCounts[goal.title]) {
          titleCounts[goal.title] = [];
        }
        titleCounts[goal.title].push(goal);
      });
      
      // Delete all but the first occurrence of each duplicate
      const deletePromises: Promise<any>[] = [];
      Object.values(titleCounts).forEach((duplicates) => {
        if (duplicates.length > 1) {
          // Keep the first, delete the rest
          for (let i = 1; i < duplicates.length; i++) {
            deletePromises.push(apiRequest("DELETE", `/api/goals/${duplicates[i].id}`));
          }
        }
      });
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Duplicate goals cleaned up!" });
    },
    onError: () => {
      toast({ title: "Failed to clean duplicates", variant: "destructive" });
    },
  });

  // Initialize goals only once
  const [hasInitialized, setHasInitialized] = useState(() => {
    // Check localStorage to prevent re-initialization
    return localStorage.getItem('devGoalsInitialized') === 'true';
  });
  
  useEffect(() => {
    const totalGoals = weeklyGoals.length + monthlyGoals.length + yearlyGoals.length;
    
    // If we have goals but they seem like duplicates (more than 16 total), clean them first
    if (totalGoals > 20) {
      clearDuplicateGoals.mutate();
      return;
    }
    
    // Only initialize if no goals exist and we haven't already initialized
    if (totalGoals === 0 && !hasInitialized && !initializeDevGoals.isPending) {
      setHasInitialized(true);
      localStorage.setItem('devGoalsInitialized', 'true');
      initializeDevGoals.mutate();
    }
  }, [weeklyGoals.length, monthlyGoals.length, yearlyGoals.length, hasInitialized]);

  // Clear all goals mutation
  const clearAllGoals = useMutation({
    mutationFn: async () => {
      const weeklyResponse = await fetch("/api/goals?type=weekly");
      const monthlyResponse = await fetch("/api/goals?type=monthly");
      const yearlyResponse = await fetch("/api/goals?type=yearly");
      
      const allWeeklyGoals = await weeklyResponse.json();
      const allMonthlyGoals = await monthlyResponse.json();
      const allYearlyGoals = await yearlyResponse.json();
      
      const allGoals = [...allWeeklyGoals, ...allMonthlyGoals, ...allYearlyGoals];
      
      const deletePromises = allGoals.map((goal: Goal) => 
        apiRequest("DELETE", `/api/goals/${goal.id}`)
      );
      
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      localStorage.removeItem('devGoalsInitialized');
      setHasInitialized(false);
      toast({ title: "All goals cleared! Reinitializing..." });
    },
    onError: () => {
      toast({ title: "Failed to clear goals", variant: "destructive" });
    },
  });

  // Manual reinitialize function for debugging
  const handleReinitialize = () => {
    clearAllGoals.mutate();
  };

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
  
  const currentWeeklyGoals = weeklyGoals.filter((goal: Goal) => {
    const goalDate = goal.targetDate;
    return goalDate >= currentWeekStart && goalDate <= currentWeekEnd;
  });

  // Filter monthly goals for current month only
  const getCurrentMonthStart = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  };
  
  const getCurrentMonthEnd = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  };

  const currentMonthStart = getCurrentMonthStart();
  const currentMonthEnd = getCurrentMonthEnd();
  
  const currentMonthlyGoals = monthlyGoals.filter((goal: Goal) => {
    const goalDate = goal.targetDate;
    const goalDateObj = new Date(goalDate);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Check if the goal's target date is in the current month and year
    return goalDateObj.getMonth() === currentMonth && goalDateObj.getFullYear() === currentYear;
  });

  // Calculate progress percentages
  const completedWeeklyGoals = currentWeeklyGoals.filter((goal: Goal) => goal.completed).length;
  const weeklyProgress = calculatePerformance(completedWeeklyGoals, currentWeeklyGoals.length);

  const completedMonthlyGoals = currentMonthlyGoals.filter((goal: Goal) => goal.completed).length;
  const monthlyProgress = calculatePerformance(completedMonthlyGoals, currentMonthlyGoals.length);

  const yearlyGoalProgress = yearlyGoals.length > 0 ? yearlyGoals[0].progress : 0;

  const handleGoalToggle = (goal: Goal) => {
    updateGoalMutation.mutate({
      id: goal.id,
      updates: { completed: !goal.completed }
    });
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  const handleSaveGoal = (goalData: InsertGoal) => {
    if (editingGoal) {
      updateGoalMutation.mutate({
        id: editingGoal.id,
        updates: goalData
      });
    } else {
      createGoalMutation.mutate(goalData);
    }
    setEditingGoal(undefined);
  };

  const getStatusBadge = (goal: Goal) => {
    if (goal.completed) {
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg border-0 font-semibold px-4 py-2">✓ Completed</Badge>;
    }
    if (goal.progress > 0) {
      return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg border-0 font-semibold px-4 py-2">⏳ In Progress</Badge>;
    }
    return <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg border-0 font-semibold px-4 py-2">⏸️ Pending</Badge>;
  };

  const getCurrentWeekRange = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${format(start, 'MMM d')}-${format(end, 'd, yyyy')}`;
  };

  const getCurrentMonth = () => {
    return format(new Date(), 'MMMM yyyy');
  };

  const getCurrentYear = () => {
    return new Date().getFullYear().toString();
  };

  const GoalSection = ({ 
    title, 
    icon, 
    goals, 
    progress, 
    dateRange,
    emptyMessage 
  }: { 
    title: string; 
    icon: string; 
    goals: Goal[]; 
    progress: number;
    dateRange: string;
    emptyMessage: string;
  }) => (
    <Card className="premium-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full"></div>
      <CardHeader>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">{icon}</span>
            </div>
            <div>
              <CardTitle className="text-2xl text-gradient-primary">{title}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">{dateRange}</p>
            </div>
          </div>
          <div className="premium-card p-3 text-center">
            <div className="text-2xl font-black text-gradient-primary">{goals.filter(g => g.completed).length}<span className="text-gray-400 mx-1">/</span>{goals.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">goals completed</div>
          </div>
        </div>
        <div className="relative">
          <Progress value={progress} className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-lg">{progress}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">{icon}</span>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">{emptyMessage.split('.')[0]}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Click the + button to add your first goal!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal: Goal) => (
              <div
                key={goal.id}
                className="goal-item premium-card p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-6 flex-1">
                    <Checkbox
                      checked={goal.completed}
                      onCheckedChange={() => handleGoalToggle(goal)}
                      className="w-6 h-6 border-2 border-primary/30 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:to-accent"
                    />
                    <div className="flex-1">
                      <div className={`text-lg font-semibold ${goal.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'} transition-colors mb-2`}>
                        {goal.title}
                      </div>
                      {goal.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                          📝 {goal.description}
                        </div>
                      )}
                      <div className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary dark:text-accent text-xs font-bold px-3 py-1 rounded-lg inline-block">
                        🎯 Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(goal)}
                    <ThreeDotMenu
                      onEdit={() => handleEditGoal(goal)}
                      onDelete={() => handleDeleteGoal(goal.id)}
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
          <h2 className="text-5xl font-black text-gradient-primary mb-4">Dev Tracker</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Track your development goals from weekly to yearly objectives with beautiful insights</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-6"></div>
        </div>

        {/* Goal Sections */}
        <div className="space-y-12">
          <GoalSection
            title="Weekly Plan"
            icon="🗓️"
            goals={currentWeeklyGoals}
            progress={weeklyProgress}
            dateRange={getCurrentWeekRange()}
            emptyMessage="No weekly goals set. Click the + button to add your first weekly goal!"
          />

          <GoalSection
            title="Monthly Plan"
            icon="📅"
            goals={currentMonthlyGoals}
            progress={monthlyProgress}
            dateRange={getCurrentMonth()}
            emptyMessage="No monthly goals set. Click the + button to add your first monthly goal!"
          />

          {/* Yearly Goal - Special Layout */}
          <Card className="premium-card relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-secondary/10 to-transparent rounded-tr-full"></div>
            <CardHeader>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-3xl">📈</span>
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-gradient-secondary mb-2">Yearly Goal</CardTitle>
                    <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">{getCurrentYear()}</p>
                  </div>
                </div>
                <div className="premium-card p-4 text-center">
                  <div className="text-3xl font-black text-gradient-secondary">{yearlyGoalProgress}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">progress</div>
                </div>
              </div>
              <div className="relative">
                <Progress value={yearlyGoalProgress} className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white drop-shadow-lg">{yearlyGoalProgress}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {yearlyGoals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-3xl flex items-center justify-center">
                    <span className="text-6xl">📈</span>
                  </div>
                  <p className="text-xl text-gray-600 dark:text-gray-400 font-medium mb-2">No yearly goal set</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Click the + button to set your yearly development goal!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {yearlyGoals.map((goal: Goal) => (
                    <div
                      key={goal.id}
                      className="goal-item premium-card p-8 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-secondary"
                    >
                      <div className="flex items-start space-x-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                          <span className="text-white text-xl">🎯</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-2xl font-bold text-gradient-secondary">
                              {goal.title}
                            </div>
                            <ThreeDotMenu
                              onEdit={() => handleEditGoal(goal)}
                              onDelete={() => handleDeleteGoal(goal.id)}
                            />
                          </div>
                          {goal.description && (
                            <div className="text-gray-700 dark:text-gray-300 mb-6 text-lg font-medium">
                              📝 {goal.description}
                            </div>
                          )}
                          
                          {/* Sub-goals progress - This would be calculated from related goals */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="premium-card p-4 text-center">
                              <div className="text-2xl font-black text-gradient-primary mb-1">{weeklyProgress}%</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">📅 Weekly Goals</div>
                            </div>
                            <div className="premium-card p-4 text-center">
                              <div className="text-2xl font-black text-gradient-secondary mb-1">{monthlyProgress}%</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">🗓️ Monthly Goals</div>
                            </div>
                            <div className="premium-card p-4 text-center">
                              <div className="text-2xl font-black text-gradient-primary mb-1">{goal.progress}%</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">🎯 Overall Progress</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* Floating Add Button */}
        <FloatingButton
          onClick={() => {
            setEditingGoal(undefined);
            setShowGoalModal(true);
          }}
        />

        {/* Goal Modal */}
        <GoalModal
          open={showGoalModal}
          onOpenChange={setShowGoalModal}
          onSave={handleSaveGoal}
          goal={editingGoal}
        />
      </div>
    </div>
  );
}
