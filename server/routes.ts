import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertWaterIntakeSchema,
  insertExerciseSchema,
  insertWorkoutTypeSchema,
  insertMindActivitySchema,
  insertRoutineItemSchema,
  insertGoalSchema,
  insertPerformanceSchema,
  insertStreakSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const date = req.query.date as string;
      const tasks = await storage.getTasks(date);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.id, req.body);
      res.json(task);
    } catch (error) {
      res.status(404).json({ message: "Task not found" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Task not found" });
    }
  });

  // Water Intake
  app.get("/api/water-intake", async (req, res) => {
    try {
      const date = req.query.date as string;
      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }
      const waterIntake = await storage.getWaterIntake(date);
      res.json(waterIntake || { date, amount: 0, goal: 2400 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch water intake" });
    }
  });

  app.post("/api/water-intake", async (req, res) => {
    try {
      const waterData = insertWaterIntakeSchema.parse(req.body);
      const waterIntake = await storage.createOrUpdateWaterIntake(waterData);
      res.json(waterIntake);
    } catch (error) {
      res.status(400).json({ message: "Invalid water intake data" });
    }
  });

  // Exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const date = req.query.date as string;
      const isWeekly = req.query.isWeekly === "true";
      const exercises = await storage.getExercises(date, isWeekly);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      res.status(400).json({ message: "Invalid exercise data" });
    }
  });

  app.patch("/api/exercises/:id", async (req, res) => {
    try {
      const exercise = await storage.updateExercise(req.params.id, req.body);
      res.json(exercise);
    } catch (error) {
      res.status(404).json({ message: "Exercise not found" });
    }
  });

  app.delete("/api/exercises/:id", async (req, res) => {
    try {
      await storage.deleteExercise(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Exercise not found" });
    }
  });

  // Workout Types
  app.get("/api/workout-types", async (req, res) => {
    try {
      const workoutTypes = await storage.getWorkoutTypes();
      res.json(workoutTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout types" });
    }
  });

  app.post("/api/workout-types", async (req, res) => {
    try {
      const workoutTypeData = insertWorkoutTypeSchema.parse(req.body);
      const workoutType = await storage.createWorkoutType(workoutTypeData);
      res.status(201).json(workoutType);
    } catch (error) {
      res.status(400).json({ message: "Invalid workout type data" });
    }
  });

  // Mind Activities
  app.get("/api/mind-activities", async (req, res) => {
    try {
      const date = req.query.date as string;
      const activities = await storage.getMindActivities(date);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mind activities" });
    }
  });

  app.post("/api/mind-activities", async (req, res) => {
    try {
      const activityData = insertMindActivitySchema.parse(req.body);
      const activity = await storage.createMindActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid mind activity data" });
    }
  });

  app.patch("/api/mind-activities/:id", async (req, res) => {
    try {
      const activity = await storage.updateMindActivity(req.params.id, req.body);
      res.json(activity);
    } catch (error) {
      res.status(404).json({ message: "Mind activity not found" });
    }
  });

  app.delete("/api/mind-activities/:id", async (req, res) => {
    try {
      await storage.deleteMindActivity(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Mind activity not found" });
    }
  });

  // Routine Items
  app.get("/api/routine-items", async (req, res) => {
    try {
      const type = req.query.type as string;
      const date = req.query.date as string;
      const items = await storage.getRoutineItems(type, date);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routine items" });
    }
  });

  app.post("/api/routine-items", async (req, res) => {
    try {
      const itemData = insertRoutineItemSchema.parse(req.body);
      const item = await storage.createRoutineItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid routine item data" });
    }
  });

  app.patch("/api/routine-items/:id", async (req, res) => {
    try {
      const item = await storage.updateRoutineItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(404).json({ message: "Routine item not found" });
    }
  });

  app.delete("/api/routine-items/:id", async (req, res) => {
    try {
      await storage.deleteRoutineItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Routine item not found" });
    }
  });

  // Goals
  app.get("/api/goals", async (req, res) => {
    try {
      const type = req.query.type as string;
      const goals = await storage.getGoals(type);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const goal = await storage.updateGoal(req.params.id, req.body);
      res.json(goal);
    } catch (error) {
      res.status(404).json({ message: "Goal not found" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      await storage.deleteGoal(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Goal not found" });
    }
  });

  // Performance
  app.get("/api/performance", async (req, res) => {
    try {
      const date = req.query.date as string;
      const performance = await storage.getPerformance(date);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance" });
    }
  });

  app.post("/api/performance", async (req, res) => {
    try {
      const performanceData = insertPerformanceSchema.parse(req.body);
      const performance = await storage.createOrUpdatePerformance(performanceData);
      res.json(performance);
    } catch (error) {
      res.status(400).json({ message: "Invalid performance data" });
    }
  });

  // Streak
  app.get("/api/streak", async (req, res) => {
    try {
      const streak = await storage.getStreak();
      res.json(streak);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  app.patch("/api/streak", async (req, res) => {
    try {
      const streak = await storage.updateStreak(req.body);
      res.json(streak);
    } catch (error) {
      res.status(400).json({ message: "Failed to update streak" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
