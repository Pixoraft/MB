import { 
  Task, InsertTask, 
  WaterIntake, InsertWaterIntake,
  Exercise, InsertExercise,
  WorkoutType, InsertWorkoutType,
  MindActivity, InsertMindActivity,
  RoutineItem, InsertRoutineItem,
  Goal, InsertGoal,
  Performance, InsertPerformance,
  Streak, InsertStreak
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Tasks
  getTasks(date?: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Water Intake
  getWaterIntake(date: string): Promise<WaterIntake | undefined>;
  createOrUpdateWaterIntake(waterIntake: InsertWaterIntake): Promise<WaterIntake>;

  // Exercises
  getExercises(date?: string, isWeekly?: boolean): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: string, exercise: Partial<Exercise>): Promise<Exercise>;
  deleteExercise(id: string): Promise<void>;

  // Workout Types
  getWorkoutTypes(): Promise<WorkoutType[]>;
  createWorkoutType(workoutType: InsertWorkoutType): Promise<WorkoutType>;
  deleteWorkoutType(id: string): Promise<void>;

  // Mind Activities
  getMindActivities(date?: string): Promise<MindActivity[]>;
  getMindActivity(id: string): Promise<MindActivity | undefined>;
  createMindActivity(activity: InsertMindActivity): Promise<MindActivity>;
  updateMindActivity(id: string, activity: Partial<MindActivity>): Promise<MindActivity>;
  deleteMindActivity(id: string): Promise<void>;

  // Routine Items
  getRoutineItems(type?: string, date?: string): Promise<RoutineItem[]>;
  getRoutineItem(id: string): Promise<RoutineItem | undefined>;
  createRoutineItem(item: InsertRoutineItem): Promise<RoutineItem>;
  updateRoutineItem(id: string, item: Partial<RoutineItem>): Promise<RoutineItem>;
  deleteRoutineItem(id: string): Promise<void>;



  // Goals
  getGoals(type?: string): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, goal: Partial<Goal>): Promise<Goal>;
  deleteGoal(id: string): Promise<void>;

  // Performance
  getPerformance(date?: string): Promise<Performance[]>;
  createOrUpdatePerformance(performance: InsertPerformance): Promise<Performance>;

  // Streak
  getStreak(): Promise<Streak>;
  updateStreak(streak: Partial<Streak>): Promise<Streak>;
}

export class MemStorage implements IStorage {
  private tasks: Map<string, Task> = new Map();
  private waterIntakes: Map<string, WaterIntake> = new Map();
  private exercises: Map<string, Exercise> = new Map();
  private workoutTypes: Map<string, WorkoutType> = new Map();
  private mindActivities: Map<string, MindActivity> = new Map();
  private routineItems: Map<string, RoutineItem> = new Map();
  private goals: Map<string, Goal> = new Map();
  private performance: Map<string, Performance> = new Map();
  private streak: Streak = { id: "default", current: 0, highest: 0 };

  // Tasks
  async getTasks(date?: string): Promise<Task[]> {
    const allTasks = Array.from(this.tasks.values());
    return date ? allTasks.filter(task => task.date === date) : allTasks;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { ...insertTask, id, createdAt: new Date().toISOString() };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  // Water Intake
  async getWaterIntake(date: string): Promise<WaterIntake | undefined> {
    return Array.from(this.waterIntakes.values()).find(w => w.date === date);
  }

  async createOrUpdateWaterIntake(insertWaterIntake: InsertWaterIntake): Promise<WaterIntake> {
    const existing = await this.getWaterIntake(insertWaterIntake.date);
    if (existing) {
      const updated = { ...existing, ...insertWaterIntake };
      this.waterIntakes.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const waterIntake: WaterIntake = { ...insertWaterIntake, id };
    this.waterIntakes.set(id, waterIntake);
    return waterIntake;
  }

  // Exercises
  async getExercises(date?: string, isWeekly?: boolean): Promise<Exercise[]> {
    const allExercises = Array.from(this.exercises.values());
    let filtered = allExercises;
    
    if (date !== undefined) {
      filtered = filtered.filter(ex => ex.date === date);
    }
    
    if (isWeekly !== undefined) {
      filtered = filtered.filter(ex => ex.isWeekly === isWeekly);
    }
    
    return filtered;
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = { ...insertExercise, id };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    const exercise = this.exercises.get(id);
    if (!exercise) throw new Error("Exercise not found");
    const updatedExercise = { ...exercise, ...updates };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }

  async deleteExercise(id: string): Promise<void> {
    this.exercises.delete(id);
  }

  // Workout Types
  async getWorkoutTypes(): Promise<WorkoutType[]> {
    return Array.from(this.workoutTypes.values());
  }

  async createWorkoutType(insertWorkoutType: InsertWorkoutType): Promise<WorkoutType> {
    const id = randomUUID();
    const workoutType: WorkoutType = { ...insertWorkoutType, id };
    this.workoutTypes.set(id, workoutType);
    return workoutType;
  }

  async deleteWorkoutType(id: string): Promise<void> {
    this.workoutTypes.delete(id);
  }

  // Mind Activities
  async getMindActivities(date?: string): Promise<MindActivity[]> {
    const allActivities = Array.from(this.mindActivities.values());
    return date ? allActivities.filter(activity => activity.date === date) : allActivities;
  }

  async getMindActivity(id: string): Promise<MindActivity | undefined> {
    return this.mindActivities.get(id);
  }

  async createMindActivity(insertActivity: InsertMindActivity): Promise<MindActivity> {
    const id = randomUUID();
    const activity: MindActivity = { ...insertActivity, id };
    this.mindActivities.set(id, activity);
    return activity;
  }

  async updateMindActivity(id: string, updates: Partial<MindActivity>): Promise<MindActivity> {
    const activity = this.mindActivities.get(id);
    if (!activity) throw new Error("Mind activity not found");
    const updatedActivity = { ...activity, ...updates };
    this.mindActivities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteMindActivity(id: string): Promise<void> {
    this.mindActivities.delete(id);
  }

  // Routine Items
  async getRoutineItems(type?: string, date?: string): Promise<RoutineItem[]> {
    const allItems = Array.from(this.routineItems.values());
    let filtered = allItems;
    
    if (type) {
      filtered = filtered.filter(item => item.type === type);
    }
    
    if (date) {
      filtered = filtered.filter(item => item.date === date);
    }
    
    return filtered;
  }

  async getRoutineItem(id: string): Promise<RoutineItem | undefined> {
    return this.routineItems.get(id);
  }

  async createRoutineItem(insertItem: InsertRoutineItem): Promise<RoutineItem> {
    const id = randomUUID();
    const item: RoutineItem = { ...insertItem, id };
    this.routineItems.set(id, item);
    return item;
  }

  async updateRoutineItem(id: string, updates: Partial<RoutineItem>): Promise<RoutineItem> {
    const item = this.routineItems.get(id);
    if (!item) throw new Error("Routine item not found");
    const updatedItem = { ...item, ...updates };
    this.routineItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteRoutineItem(id: string): Promise<void> {
    this.routineItems.delete(id);
  }



  // Goals
  async getGoals(type?: string): Promise<Goal[]> {
    const allGoals = Array.from(this.goals.values());
    return type ? allGoals.filter(goal => goal.type === type) : allGoals;
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = { ...insertGoal, id };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const goal = this.goals.get(id);
    if (!goal) throw new Error("Goal not found");
    const updatedGoal = { ...goal, ...updates };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: string): Promise<void> {
    this.goals.delete(id);
  }

  // Performance
  async getPerformance(date?: string): Promise<Performance[]> {
    const allPerformance = Array.from(this.performance.values());
    return date ? allPerformance.filter(p => p.date === date) : allPerformance;
  }

  async createOrUpdatePerformance(insertPerformance: InsertPerformance): Promise<Performance> {
    const existing = Array.from(this.performance.values()).find(p => p.date === insertPerformance.date);
    if (existing) {
      const updated = { ...existing, ...insertPerformance };
      this.performance.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const performance: Performance = { ...insertPerformance, id };
    this.performance.set(id, performance);
    return performance;
  }

  // Streak
  async getStreak(): Promise<Streak> {
    return this.streak;
  }

  async updateStreak(updates: Partial<Streak>): Promise<Streak> {
    this.streak = { ...this.streak, ...updates };
    return this.streak;
  }
}

export const storage = new MemStorage();

// Clear existing data to prevent duplicates
export const clearAllData = async () => {
  const allTasks = await storage.getTasks();
  const allExercises = await storage.getExercises();
  const allGoals = await storage.getGoals();
  const allRoutines = await storage.getRoutineItems();
  
  // Clear all existing data
  for (const task of allTasks) {
    await storage.deleteTask(task.id);
  }
  for (const exercise of allExercises) {
    await storage.deleteExercise(exercise.id);
  }
  for (const goal of allGoals) {
    await storage.deleteGoal(goal.id);
  }
  for (const routine of allRoutines) {
    await storage.deleteRoutineItem(routine.id);
  }
  
  console.log('✅ All existing data cleared');
};

// Initialize sample data
export const initializeSampleData = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  // Clear existing data first to prevent duplicates
  await clearAllData();
  
  console.log('🚀 Initializing fresh sample data...');
  
  // Initialize sample tasks
  console.log('📝 Creating sample tasks...');
    await storage.createTask({
      title: "Review daily goals",
      description: "Check and update today's priorities",
      date: today,
      completed: false,
      status: "pending",
      time: "09:00",
      duration: 15
    });
    
    await storage.createTask({
      title: "Drink 8 glasses of water",
      description: "Stay hydrated throughout the day",
      date: today,
      completed: false,
      status: "pending",
      time: "10:00",
      duration: undefined
    });
    
    await storage.createTask({
      title: "Complete workout routine",
      description: "Follow today's exercise plan",
      date: today,
      completed: false,
      status: "pending",
      time: "18:00",
      duration: 45
    });
  
  // Initialize sample exercises
  console.log('💪 Creating sample exercises...');
    // Daily exercises
    await storage.createExercise({
      name: "Morning Yoga",
      duration: 20,
      sets: 1,
      reps: "20 min flow",
      date: today,
      isWeekly: false,
      completed: false
    });
    
    await storage.createExercise({
      name: "Push-ups",
      duration: 5,
      sets: 3,
      reps: "15",
      date: today,
      isWeekly: false,
      completed: false
    });
    
    await storage.createExercise({
      name: "Evening Walk",
      duration: 30,
      sets: 1,
      reps: "30 min walk",
      date: today,
      isWeekly: false,
      completed: false
    });
    
    // Weekly exercises
    await storage.createExercise({
      name: "Full Body Strength Training",
      duration: 60,
      sets: 4,
      reps: "12",
      date: today,
      isWeekly: true,
      completed: false
    });
    
    await storage.createExercise({
      name: "Cardio Session",
      duration: 45,
      sets: 1,
      reps: "45 min session",
      date: today,
      isWeekly: true,
      completed: false
    });
    
    await storage.createExercise({
      name: "Flexibility & Stretching",
      duration: 30,
      sets: 1,
      reps: "30 min stretch",
      date: today,
      isWeekly: true,
      completed: false
    });
  
  // Initialize sample goals
  console.log('🎯 Creating sample goals...');
    await storage.createGoal({
      title: "2025: Hit ₹60K/month as Full-Stack Developer",
      description: "Master modern web development stack and land high-paying remote opportunities",
      type: "yearly",
      targetDate: "2025-12-31",
      completed: false,
      progress: 25
    });
    
    await storage.createGoal({
      title: "April 2025 - Foundation & Setup",
      description: "Complete JavaScript fundamentals, setup development environment, and create portfolio foundation",
      type: "monthly", 
      targetDate: "2025-04-30",
      completed: false,
      progress: 60
    });
    
    await storage.createGoal({
      title: "Week 1: Advanced JavaScript Mastery",
      description: "Deep dive into ES6+, async/await, closures, prototypes, and modern JavaScript patterns. Complete 3 complex projects.",
      type: "weekly",
      targetDate: "2025-04-07",
      completed: false,
      progress: 80
    });
    
    await storage.createGoal({
      title: "Week 2: React & Component Architecture",
      description: "Build complex React applications with hooks, context, and state management. Create 2 portfolio projects.",
      type: "weekly",
      targetDate: "2025-04-14",
      completed: false,
      progress: 30
    });
    
    await storage.createGoal({
      title: "Week 3: Backend Development with Node.js",
      description: "Learn Express.js, RESTful APIs, and database integration. Build full-stack applications.",
      type: "weekly",
      targetDate: "2025-04-21",
      completed: false,
      progress: 0
    });
  
  // Initialize sample routine items  
  console.log('📅 Creating sample routine items...');
    // Morning routine
    await storage.createRoutineItem({
      name: "🍋 Lemon & Honey Detox Drink",
      time: "06:00",
      duration: 5,
      type: "morning",
      date: today,
      completed: false,
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    });
    
    await storage.createRoutineItem({
      name: "🧊 Ice Cube Face Treatment",
      time: "06:15",
      duration: 3,
      type: "morning",
      date: today,
      completed: false,
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    });
    
    await storage.createRoutineItem({
      name: "🧘‍♀️ Morning Meditation",
      time: "06:30",
      duration: 10,
      type: "morning",
      date: today,
      completed: false,
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    });
    
    // Night routine
    await storage.createRoutineItem({
      name: "🧴 Evening Skincare Routine",
      time: "21:30",
      duration: 15,
      type: "night",
      date: today,
      completed: false,
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    });
    
    await storage.createRoutineItem({
      name: "📱 Digital Detox",
      time: "22:00",
      duration: 60,
      type: "night",
      date: today,
      completed: false,
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    });
    
    await storage.createRoutineItem({
      name: "📚 Reading Time",
      time: "22:00",
      duration: 30,
      type: "night",
      date: today,
      completed: false,
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    });
    
    // Weekly routines
    await storage.createRoutineItem({
      name: "🧹 Deep Clean Living Space",
      time: "10:00",
      duration: 90,
      type: "weekly",
      date: today,
      completed: false,
      days: ["saturday"]
    });
    
    await storage.createRoutineItem({
      name: "🛒 Grocery Shopping & Meal Prep",
      time: "11:00",
      duration: 120,
      type: "weekly",
      date: today,
      completed: false,
      days: ["sunday"]
    });
    
    await storage.createRoutineItem({
      name: "🗓️ Weekly Planning & Review",
      time: "19:00",
      duration: 45,
      type: "weekly",
      date: today,
      completed: false,
      days: ["sunday"]
    });
  
  console.log('✅ Server sample data initialized');
};
