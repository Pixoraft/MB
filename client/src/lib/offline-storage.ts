import { 
  Task, InsertTask, 
  WaterIntake, InsertWaterIntake,
  Exercise, InsertExercise,
  MindActivity, InsertMindActivity,
  RoutineItem, InsertRoutineItem,
  Goal, InsertGoal,
  Performance, InsertPerformance
} from "@shared/schema";

// Local storage keys
const STORAGE_KEYS = {
  TASKS: 'meta-build-tasks',
  WATER: 'meta-build-water',
  EXERCISES: 'meta-build-exercises',
  MIND_ACTIVITIES: 'meta-build-mind-activities',
  ROUTINE_ITEMS: 'meta-build-routine-items',
  GOALS: 'meta-build-goals',
  PERFORMANCE: 'meta-build-performance',
  STREAK: 'meta-build-streak',
  OFFLINE_REQUESTS: 'meta-build-offline-requests'
};

// Utility functions for local storage
export class OfflineStorage {
  // Generic storage methods
  private static getItems<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return [];
    }
  }

  private static setItems<T>(key: string, items: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
    }
  }

  private static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Tasks
  static getTasks(date?: string): Task[] {
    const tasks = this.getItems<Task>(STORAGE_KEYS.TASKS);
    return date ? tasks.filter(task => task.date === date) : tasks;
  }

  static createTask(insertTask: InsertTask): Task {
    const tasks = this.getItems<Task>(STORAGE_KEYS.TASKS);
    const task: Task = { 
      ...insertTask, 
      id: this.generateId(), 
      createdAt: new Date().toISOString() 
    };
    tasks.push(task);
    this.setItems(STORAGE_KEYS.TASKS, tasks);
    return task;
  }

  static updateTask(id: string, updates: Partial<Task>): Task {
    const tasks = this.getItems<Task>(STORAGE_KEYS.TASKS);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    
    const updatedTask = { ...tasks[index], ...updates };
    tasks[index] = updatedTask;
    this.setItems(STORAGE_KEYS.TASKS, tasks);
    return updatedTask;
  }

  static deleteTask(id: string): void {
    const tasks = this.getItems<Task>(STORAGE_KEYS.TASKS);
    const filtered = tasks.filter(t => t.id !== id);
    this.setItems(STORAGE_KEYS.TASKS, filtered);
  }

  // Water Intake
  static getWaterIntake(date: string): WaterIntake | null {
    const waterIntakes = this.getItems<WaterIntake>(STORAGE_KEYS.WATER);
    return waterIntakes.find(w => w.date === date) || null;
  }

  static createOrUpdateWaterIntake(insertWater: InsertWaterIntake): WaterIntake {
    const waterIntakes = this.getItems<WaterIntake>(STORAGE_KEYS.WATER);
    const existingIndex = waterIntakes.findIndex(w => w.date === insertWater.date);
    
    if (existingIndex !== -1) {
      const updated = { ...waterIntakes[existingIndex], ...insertWater };
      waterIntakes[existingIndex] = updated;
      this.setItems(STORAGE_KEYS.WATER, waterIntakes);
      return updated;
    }
    
    const waterIntake: WaterIntake = { ...insertWater, id: this.generateId() };
    waterIntakes.push(waterIntake);
    this.setItems(STORAGE_KEYS.WATER, waterIntakes);
    return waterIntake;
  }

  // Exercises
  static getExercises(date?: string, isWeekly?: boolean): Exercise[] {
    let exercises = this.getItems<Exercise>(STORAGE_KEYS.EXERCISES);
    
    if (date !== undefined) {
      exercises = exercises.filter(ex => ex.date === date);
    }
    
    if (isWeekly !== undefined) {
      exercises = exercises.filter(ex => ex.isWeekly === isWeekly);
    }
    
    return exercises;
  }

  static createExercise(insertExercise: InsertExercise): Exercise {
    const exercises = this.getItems<Exercise>(STORAGE_KEYS.EXERCISES);
    const exercise: Exercise = { ...insertExercise, id: this.generateId() };
    exercises.push(exercise);
    this.setItems(STORAGE_KEYS.EXERCISES, exercises);
    return exercise;
  }

  static updateExercise(id: string, updates: Partial<Exercise>): Exercise {
    const exercises = this.getItems<Exercise>(STORAGE_KEYS.EXERCISES);
    const index = exercises.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Exercise not found');
    
    const updated = { ...exercises[index], ...updates };
    exercises[index] = updated;
    this.setItems(STORAGE_KEYS.EXERCISES, exercises);
    return updated;
  }

  static deleteExercise(id: string): void {
    const exercises = this.getItems<Exercise>(STORAGE_KEYS.EXERCISES);
    const filtered = exercises.filter(e => e.id !== id);
    this.setItems(STORAGE_KEYS.EXERCISES, filtered);
  }

  // Mind Activities
  static getMindActivities(date?: string): MindActivity[] {
    const activities = this.getItems<MindActivity>(STORAGE_KEYS.MIND_ACTIVITIES);
    return date ? activities.filter(a => a.date === date) : activities;
  }

  static createMindActivity(insertActivity: InsertMindActivity): MindActivity {
    const activities = this.getItems<MindActivity>(STORAGE_KEYS.MIND_ACTIVITIES);
    const activity: MindActivity = { ...insertActivity, id: this.generateId() };
    activities.push(activity);
    this.setItems(STORAGE_KEYS.MIND_ACTIVITIES, activities);
    return activity;
  }

  static updateMindActivity(id: string, updates: Partial<MindActivity>): MindActivity {
    const activities = this.getItems<MindActivity>(STORAGE_KEYS.MIND_ACTIVITIES);
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Mind activity not found');
    
    const updated = { ...activities[index], ...updates };
    activities[index] = updated;
    this.setItems(STORAGE_KEYS.MIND_ACTIVITIES, activities);
    return updated;
  }

  static deleteMindActivity(id: string): void {
    const activities = this.getItems<MindActivity>(STORAGE_KEYS.MIND_ACTIVITIES);
    const filtered = activities.filter(a => a.id !== id);
    this.setItems(STORAGE_KEYS.MIND_ACTIVITIES, filtered);
  }

  // Routine Items
  static getRoutineItems(type?: string): RoutineItem[] {
    const items = this.getItems<RoutineItem>(STORAGE_KEYS.ROUTINE_ITEMS);
    return type ? items.filter(i => i.type === type) : items;
  }

  static createRoutineItem(insertItem: InsertRoutineItem): RoutineItem {
    const items = this.getItems<RoutineItem>(STORAGE_KEYS.ROUTINE_ITEMS);
    const item: RoutineItem = { ...insertItem, id: this.generateId() };
    items.push(item);
    this.setItems(STORAGE_KEYS.ROUTINE_ITEMS, items);
    return item;
  }

  static updateRoutineItem(id: string, updates: Partial<RoutineItem>): RoutineItem {
    const items = this.getItems<RoutineItem>(STORAGE_KEYS.ROUTINE_ITEMS);
    const index = items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Routine item not found');
    
    const updated = { ...items[index], ...updates };
    items[index] = updated;
    this.setItems(STORAGE_KEYS.ROUTINE_ITEMS, items);
    return updated;
  }

  static deleteRoutineItem(id: string): void {
    const items = this.getItems<RoutineItem>(STORAGE_KEYS.ROUTINE_ITEMS);
    const filtered = items.filter(i => i.id !== id);
    this.setItems(STORAGE_KEYS.ROUTINE_ITEMS, filtered);
  }

  // Goals
  static getGoals(type?: string): Goal[] {
    const goals = this.getItems<Goal>(STORAGE_KEYS.GOALS);
    return type ? goals.filter(g => g.type === type) : goals;
  }

  static createGoal(insertGoal: InsertGoal): Goal {
    const goals = this.getItems<Goal>(STORAGE_KEYS.GOALS);
    const goal: Goal = { ...insertGoal, id: this.generateId() };
    goals.push(goal);
    this.setItems(STORAGE_KEYS.GOALS, goals);
    return goal;
  }

  static updateGoal(id: string, updates: Partial<Goal>): Goal {
    const goals = this.getItems<Goal>(STORAGE_KEYS.GOALS);
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Goal not found');
    
    const updated = { ...goals[index], ...updates };
    goals[index] = updated;
    this.setItems(STORAGE_KEYS.GOALS, goals);
    return updated;
  }

  static deleteGoal(id: string): void {
    const goals = this.getItems<Goal>(STORAGE_KEYS.GOALS);
    const filtered = goals.filter(g => g.id !== id);
    this.setItems(STORAGE_KEYS.GOALS, filtered);
  }

  // Performance
  static getPerformance(date?: string): Performance[] {
    const performances = this.getItems<Performance>(STORAGE_KEYS.PERFORMANCE);
    return date ? performances.filter(p => p.date === date) : performances;
  }

  static createOrUpdatePerformance(insertPerformance: InsertPerformance): Performance {
    const performances = this.getItems<Performance>(STORAGE_KEYS.PERFORMANCE);
    const existingIndex = performances.findIndex(p => p.date === insertPerformance.date);
    
    if (existingIndex !== -1) {
      const updated = { ...performances[existingIndex], ...insertPerformance };
      performances[existingIndex] = updated;
      this.setItems(STORAGE_KEYS.PERFORMANCE, performances);
      return updated;
    }
    
    const performance: Performance = { ...insertPerformance, id: this.generateId() };
    performances.push(performance);
    this.setItems(STORAGE_KEYS.PERFORMANCE, performances);
    return performance;
  }

  // Streak
  static getStreak(): { id: string; current: number; highest: number } {
    const streak = localStorage.getItem(STORAGE_KEYS.STREAK);
    return streak ? JSON.parse(streak) : { id: "default", current: 0, highest: 0 };
  }

  static updateStreak(updates: { current: number; highest: number }): { id: string; current: number; highest: number } {
    const streak = { id: "default", ...updates };
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
    return streak;
  }

  // Clear all data (for testing)
  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}