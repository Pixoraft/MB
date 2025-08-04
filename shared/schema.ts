import { z } from "zod";
import { pgTable, text, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Task Management
export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  time: z.string().optional(),
  duration: z.number().optional(),
  status: z.enum(["pending", "in-progress", "completed"]).default("pending"),
  completed: z.boolean().default(false),
  date: z.string(), // ISO date string
  createdAt: z.string().default(() => new Date().toISOString()),
});

export const insertTaskSchema = taskSchema.omit({ id: true, createdAt: true });
export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Water Intake
export const waterIntakeSchema = z.object({
  id: z.string(),
  date: z.string(),
  amount: z.number().default(0), // in ml
  goal: z.number().default(2400), // daily goal in ml
});

export const insertWaterIntakeSchema = waterIntakeSchema.omit({ id: true });
export type WaterIntake = z.infer<typeof waterIntakeSchema>;
export type InsertWaterIntake = z.infer<typeof insertWaterIntakeSchema>;

// Workout Management
export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Exercise name is required"),
  sets: z.number().min(1),
  reps: z.string(), // Can be number or time-based like "1 min hold"
  duration: z.number().optional(), // in minutes
  completed: z.boolean().default(false),
  date: z.string(),
  day: z.enum(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]).optional(),
  workoutType: z.string().optional(),
  isWeekly: z.boolean().default(false),
});

export const insertExerciseSchema = exerciseSchema.omit({ id: true });
export type Exercise = z.infer<typeof exerciseSchema>;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export const workoutTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Workout type name is required"),
  isWeekly: z.boolean().default(false),
  maxTimeToComplete: z.number().optional(), // in minutes
});

export const insertWorkoutTypeSchema = workoutTypeSchema.omit({ id: true });
export type WorkoutType = z.infer<typeof workoutTypeSchema>;
export type InsertWorkoutType = z.infer<typeof insertWorkoutTypeSchema>;

// Mind Workout
export const mindActivitySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Activity name is required"),
  description: z.string(),
  time: z.string(),
  chatgptRole: z.string(),
  completed: z.boolean().default(false),
  date: z.string(),
  status: z.enum(["pending", "in-progress", "completed"]).default("pending"),
});

export const insertMindActivitySchema = mindActivitySchema.omit({ id: true });
export type MindActivity = z.infer<typeof mindActivitySchema>;
export type InsertMindActivity = z.infer<typeof insertMindActivitySchema>;

// Daily Routine
export const routineItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Routine name is required"),
  time: z.string(),
  duration: z.number(), // in minutes
  type: z.enum(["morning", "night", "weekly", "skincare"]),
  days: z.array(z.enum(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"])).optional(),
  completed: z.boolean().default(false),
  date: z.string(),
});

export const insertRoutineItemSchema = routineItemSchema.omit({ id: true });
export type RoutineItem = z.infer<typeof routineItemSchema>;
export type InsertRoutineItem = z.infer<typeof insertRoutineItemSchema>;



// Development Tracker
export const goalSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Goal title is required"),
  description: z.string().optional(),
  type: z.enum(["weekly", "monthly", "yearly"]),
  targetDate: z.string(),
  completed: z.boolean().default(false),
  progress: z.number().min(0).max(100).default(0),
  parentGoalId: z.string().optional(), // for linking weekly to monthly, monthly to yearly
});

export const insertGoalSchema = goalSchema.omit({ id: true });
export type Goal = z.infer<typeof goalSchema>;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

// Performance Tracking
export const performanceSchema = z.object({
  id: z.string(),
  date: z.string(),
  tasks: z.number().min(0).max(100).default(0),
  workout: z.number().min(0).max(100).default(0),
  mindWorkout: z.number().min(0).max(100).default(0),
  routine: z.number().min(0).max(100).default(0),
  overall: z.number().min(0).max(100).default(0),
});

export const insertPerformanceSchema = performanceSchema.omit({ id: true });
export type Performance = z.infer<typeof performanceSchema>;
export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;

// Streak Tracking
export const streakSchema = z.object({
  id: z.string(),
  current: z.number().default(0),
  highest: z.number().default(0),
  lastActiveDate: z.string().optional(),
});

export const insertStreakSchema = streakSchema.omit({ id: true });
export type Streak = z.infer<typeof streakSchema>;
export type InsertStreak = z.infer<typeof insertStreakSchema>;

// Drizzle Table Definitions
export const tasksTable = pgTable("tasks", {
  id: text("id").primaryKey().default("nanoid()"),
  title: text("title").notNull(),
  description: text("description"),
  time: text("time"),
  duration: integer("duration"),
  status: text("status").default("pending"),
  completed: boolean("completed").default(false),
  date: text("date").notNull(),
  createdAt: text("created_at").default("now()"),
});

export const waterIntakeTable = pgTable("water_intake", {
  id: text("id").primaryKey().default("nanoid()"),
  date: text("date").notNull().unique(),
  amount: integer("amount").default(0),
  goal: integer("goal").default(2400),
});

export const exercisesTable = pgTable("exercises", {
  id: text("id").primaryKey().default("nanoid()"),
  name: text("name").notNull(),
  sets: integer("sets").notNull(),
  reps: text("reps").notNull(),
  duration: integer("duration"),
  completed: boolean("completed").default(false),
  date: text("date").notNull(),
  day: text("day"),
  workoutType: text("workout_type"),
  isWeekly: boolean("is_weekly").default(false),
});

export const workoutTypesTable = pgTable("workout_types", {
  id: text("id").primaryKey().default("nanoid()"),
  name: text("name").notNull(),
  isWeekly: boolean("is_weekly").default(false),
  maxTimeToComplete: integer("max_time_to_complete"),
});

export const mindActivitiesTable = pgTable("mind_activities", {
  id: text("id").primaryKey().default("nanoid()"),
  name: text("name").notNull(),
  description: text("description").notNull(),
  time: text("time").notNull(),
  chatgptRole: text("chatgpt_role").notNull(),
  completed: boolean("completed").default(false),
  date: text("date").notNull(),
  status: text("status").default("pending"),
});

export const routineItemsTable = pgTable("routine_items", {
  id: text("id").primaryKey().default("nanoid()"),
  name: text("name").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull(),
  type: text("type").notNull(),
  days: text("days"), // JSON array as text
  completed: boolean("completed").default(false),
  date: text("date").notNull(),
});

export const goalsTable = pgTable("goals", {
  id: text("id").primaryKey().default("nanoid()"),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  targetDate: text("target_date").notNull(),
  completed: boolean("completed").default(false),
  progress: integer("progress").default(0),
  parentGoalId: text("parent_goal_id"),
});

export const performanceTable = pgTable("performance", {
  id: text("id").primaryKey().default("nanoid()"),
  date: text("date").notNull(),
  type: text("type").notNull(),
  tasks: integer("tasks").default(0),
  workout: integer("workout").default(0),
  mindWorkout: integer("mind_workout").default(0),
  routine: integer("routine").default(0),
  overall: integer("overall").default(0),
});

export const streakTable = pgTable("streak", {
  id: text("id").primaryKey().default("default"),
  current: integer("current").default(0),
  highest: integer("highest").default(0),
  lastActiveDate: text("last_active_date"),
});

// Drizzle inferred types
export type TaskTable = typeof tasksTable.$inferSelect;
export type InsertTaskTable = typeof tasksTable.$inferInsert;
