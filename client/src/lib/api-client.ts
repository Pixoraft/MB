import { OfflineStorage } from './offline-storage';
import { 
  Task, InsertTask, 
  WaterIntake, InsertWaterIntake,
  Exercise, InsertExercise,
  MindActivity, InsertMindActivity,
  RoutineItem, InsertRoutineItem,
  Goal, InsertGoal,
  Performance, InsertPerformance
} from "@shared/schema";

// API Client that works offline
export class ApiClient {
  private static isOnline(): boolean {
    return navigator.onLine;
  }

  // Generic API request function
  private static async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // If offline or network error, use local storage
      console.log('API request failed, using offline storage:', error);
      throw new Error('OFFLINE');
    }
  }

  // Tasks API
  static async getTasks(date?: string): Promise<Task[]> {
    if (!this.isOnline()) {
      return OfflineStorage.getTasks(date);
    }

    try {
      const url = date ? `/api/tasks?date=${date}` : '/api/tasks';
      return await this.request<Task[]>('GET', url);
    } catch (error) {
      return OfflineStorage.getTasks(date);
    }
  }

  static async createTask(task: InsertTask): Promise<Task> {
    if (!this.isOnline()) {
      return OfflineStorage.createTask(task);
    }

    try {
      return await this.request<Task>('POST', '/api/tasks', task);
    } catch (error) {
      return OfflineStorage.createTask(task);
    }
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    if (!this.isOnline()) {
      return OfflineStorage.updateTask(id, updates);
    }

    try {
      return await this.request<Task>('PATCH', `/api/tasks/${id}`, updates);
    } catch (error) {
      return OfflineStorage.updateTask(id, updates);
    }
  }

  static async deleteTask(id: string): Promise<void> {
    if (!this.isOnline()) {
      return OfflineStorage.deleteTask(id);
    }

    try {
      await this.request<void>('DELETE', `/api/tasks/${id}`);
    } catch (error) {
      OfflineStorage.deleteTask(id);
    }
  }

  // Water Intake API
  static async getWaterIntake(date: string): Promise<WaterIntake | null> {
    if (!this.isOnline()) {
      return OfflineStorage.getWaterIntake(date);
    }

    try {
      return await this.request<WaterIntake>('GET', `/api/water-intake?date=${date}`);
    } catch (error) {
      return OfflineStorage.getWaterIntake(date);
    }
  }

  static async createOrUpdateWaterIntake(water: InsertWaterIntake): Promise<WaterIntake> {
    if (!this.isOnline()) {
      return OfflineStorage.createOrUpdateWaterIntake(water);
    }

    try {
      return await this.request<WaterIntake>('POST', '/api/water-intake', water);
    } catch (error) {
      return OfflineStorage.createOrUpdateWaterIntake(water);
    }
  }

  // Exercises API
  static async getExercises(date?: string, isWeekly?: boolean): Promise<Exercise[]> {
    if (!this.isOnline()) {
      return OfflineStorage.getExercises(date, isWeekly);
    }

    try {
      let url = '/api/exercises';
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (isWeekly !== undefined) params.append('isWeekly', isWeekly.toString());
      if (params.toString()) url += `?${params.toString()}`;
      
      return await this.request<Exercise[]>('GET', url);
    } catch (error) {
      return OfflineStorage.getExercises(date, isWeekly);
    }
  }

  static async createExercise(exercise: InsertExercise): Promise<Exercise> {
    if (!this.isOnline()) {
      return OfflineStorage.createExercise(exercise);
    }

    try {
      return await this.request<Exercise>('POST', '/api/exercises', exercise);
    } catch (error) {
      return OfflineStorage.createExercise(exercise);
    }
  }

  static async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    if (!this.isOnline()) {
      return OfflineStorage.updateExercise(id, updates);
    }

    try {
      return await this.request<Exercise>('PATCH', `/api/exercises/${id}`, updates);
    } catch (error) {
      return OfflineStorage.updateExercise(id, updates);
    }
  }

  static async deleteExercise(id: string): Promise<void> {
    if (!this.isOnline()) {
      return OfflineStorage.deleteExercise(id);
    }

    try {
      await this.request<void>('DELETE', `/api/exercises/${id}`);
    } catch (error) {
      OfflineStorage.deleteExercise(id);
    }
  }

  // Mind Activities API
  static async getMindActivities(date?: string): Promise<MindActivity[]> {
    if (!this.isOnline()) {
      return OfflineStorage.getMindActivities(date);
    }

    try {
      const url = date ? `/api/mind-activities?date=${date}` : '/api/mind-activities';
      return await this.request<MindActivity[]>('GET', url);
    } catch (error) {
      return OfflineStorage.getMindActivities(date);
    }
  }

  static async createMindActivity(activity: InsertMindActivity): Promise<MindActivity> {
    if (!this.isOnline()) {
      return OfflineStorage.createMindActivity(activity);
    }

    try {
      return await this.request<MindActivity>('POST', '/api/mind-activities', activity);
    } catch (error) {
      return OfflineStorage.createMindActivity(activity);
    }
  }

  static async updateMindActivity(id: string, updates: Partial<MindActivity>): Promise<MindActivity> {
    if (!this.isOnline()) {
      return OfflineStorage.updateMindActivity(id, updates);
    }

    try {
      return await this.request<MindActivity>('PATCH', `/api/mind-activities/${id}`, updates);
    } catch (error) {
      return OfflineStorage.updateMindActivity(id, updates);
    }
  }

  static async deleteMindActivity(id: string): Promise<void> {
    if (!this.isOnline()) {
      return OfflineStorage.deleteMindActivity(id);
    }

    try {
      await this.request<void>('DELETE', `/api/mind-activities/${id}`);
    } catch (error) {
      OfflineStorage.deleteMindActivity(id);
    }
  }

  // Routine Items API
  static async getRoutineItems(type?: string): Promise<RoutineItem[]> {
    if (!this.isOnline()) {
      return OfflineStorage.getRoutineItems(type);
    }

    try {
      const url = type ? `/api/routine-items?type=${type}` : '/api/routine-items';
      return await this.request<RoutineItem[]>('GET', url);
    } catch (error) {
      return OfflineStorage.getRoutineItems(type);
    }
  }

  static async createRoutineItem(item: InsertRoutineItem): Promise<RoutineItem> {
    if (!this.isOnline()) {
      return OfflineStorage.createRoutineItem(item);
    }

    try {
      return await this.request<RoutineItem>('POST', '/api/routine-items', item);
    } catch (error) {
      return OfflineStorage.createRoutineItem(item);
    }
  }

  static async updateRoutineItem(id: string, updates: Partial<RoutineItem>): Promise<RoutineItem> {
    if (!this.isOnline()) {
      return OfflineStorage.updateRoutineItem(id, updates);
    }

    try {
      return await this.request<RoutineItem>('PATCH', `/api/routine-items/${id}`, updates);
    } catch (error) {
      return OfflineStorage.updateRoutineItem(id, updates);
    }
  }

  static async deleteRoutineItem(id: string): Promise<void> {
    if (!this.isOnline()) {
      return OfflineStorage.deleteRoutineItem(id);
    }

    try {
      await this.request<void>('DELETE', `/api/routine-items/${id}`);
    } catch (error) {
      OfflineStorage.deleteRoutineItem(id);
    }
  }

  // Goals API
  static async getGoals(type?: string): Promise<Goal[]> {
    if (!this.isOnline()) {
      return OfflineStorage.getGoals(type);
    }

    try {
      const url = type ? `/api/goals?type=${type}` : '/api/goals';
      return await this.request<Goal[]>('GET', url);
    } catch (error) {
      return OfflineStorage.getGoals(type);
    }
  }

  static async createGoal(goal: InsertGoal): Promise<Goal> {
    if (!this.isOnline()) {
      return OfflineStorage.createGoal(goal);
    }

    try {
      return await this.request<Goal>('POST', '/api/goals', goal);
    } catch (error) {
      return OfflineStorage.createGoal(goal);
    }
  }

  static async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    if (!this.isOnline()) {
      return OfflineStorage.updateGoal(id, updates);
    }

    try {
      return await this.request<Goal>('PATCH', `/api/goals/${id}`, updates);
    } catch (error) {
      return OfflineStorage.updateGoal(id, updates);
    }
  }

  static async deleteGoal(id: string): Promise<void> {
    if (!this.isOnline()) {
      return OfflineStorage.deleteGoal(id);
    }

    try {
      await this.request<void>('DELETE', `/api/goals/${id}`);
    } catch (error) {
      OfflineStorage.deleteGoal(id);
    }
  }

  // Performance API
  static async getPerformance(date?: string): Promise<Performance[]> {
    if (!this.isOnline()) {
      return OfflineStorage.getPerformance(date);
    }

    try {
      const url = date ? `/api/performance?date=${date}` : '/api/performance';
      return await this.request<Performance[]>('GET', url);
    } catch (error) {
      return OfflineStorage.getPerformance(date);
    }
  }

  static async createOrUpdatePerformance(performance: InsertPerformance): Promise<Performance> {
    if (!this.isOnline()) {
      return OfflineStorage.createOrUpdatePerformance(performance);
    }

    try {
      return await this.request<Performance>('POST', '/api/performance', performance);
    } catch (error) {
      return OfflineStorage.createOrUpdatePerformance(performance);
    }
  }

  // Streak API
  static async getStreak(): Promise<{ id: string; current: number; highest: number }> {
    if (!this.isOnline()) {
      return OfflineStorage.getStreak();
    }

    try {
      return await this.request<{ id: string; current: number; highest: number }>('GET', '/api/streak');
    } catch (error) {
      return OfflineStorage.getStreak();
    }
  }

  static async updateStreak(updates: { current: number; highest: number }): Promise<{ id: string; current: number; highest: number }> {
    if (!this.isOnline()) {
      return OfflineStorage.updateStreak(updates);
    }

    try {
      return await this.request<{ id: string; current: number; highest: number }>('PATCH', '/api/streak', updates);
    } catch (error) {
      return OfflineStorage.updateStreak(updates);
    }
  }
}