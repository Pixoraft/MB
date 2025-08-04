import { OfflineStorage } from './offline-storage';

// Initialize app with sample data for better user experience
export const initializeSampleData = () => {
  // Check if data already exists
  const existingTasks = OfflineStorage.getTasks();
  const existingGoals = OfflineStorage.getGoals();
  const existingRoutines = OfflineStorage.getRoutineItems();
  
  // Only initialize if no data exists
  if (existingTasks.length === 0) {
    // Add sample tasks for today
    const today = new Date().toISOString().split('T')[0];
    
    OfflineStorage.createTask({
      title: "Review daily goals",
      description: "Check and update today's priorities",
      date: today,
      completed: false,
      status: "pending",
      time: "09:00",
      duration: 15
    });
    
    OfflineStorage.createTask({
      title: "Drink 8 glasses of water",
      description: "Stay hydrated throughout the day",
      date: today,
      completed: false,
      status: "pending",
      time: "10:00",
      duration: undefined
    });
    
    OfflineStorage.createTask({
      title: "Complete workout routine",
      description: "Follow today's exercise plan",
      date: today,
      completed: false,
      status: "pending",
      time: "18:00",
      duration: 45
    });
  }
  
  // Initialize goals if none exist
  if (existingGoals.length === 0) {
    // Add 2025 development goals
    OfflineStorage.createGoal({
      title: "2025: Hit ₹60K/month as Full-Stack Developer",
      description: "Master modern web development stack and land high-paying remote opportunities",
      type: "yearly",
      targetDate: "2025-12-31",
      completed: false,
      progress: 25
    });
    
    OfflineStorage.createGoal({
      title: "April 2025 - Foundation & Setup",
      description: "Complete JavaScript fundamentals, setup development environment, and create portfolio foundation",
      type: "monthly", 
      targetDate: "2025-04-30",
      completed: false,
      progress: 60
    });
    
    OfflineStorage.createGoal({
      title: "Week 1: Advanced JavaScript Mastery",
      description: "Deep dive into ES6+, async/await, closures, prototypes, and modern JavaScript patterns. Complete 3 complex projects.",
      type: "weekly",
      targetDate: "2025-04-07",
      completed: false,
      progress: 80
    });
  }
  
  // Initialize routine items if none exist
  if (existingRoutines.length === 0) {
    // Morning routine
    const today = new Date().toISOString().split('T')[0];
    
    OfflineStorage.createRoutineItem({
      name: "🍋 Lemon & Honey Detox Drink",
      time: "06:00",
      duration: 5,
      type: "morning",
      date: today,
      completed: false,
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    });
    
    OfflineStorage.createRoutineItem({
      name: "🧊 Ice Cube Face Treatment",
      time: "06:15",
      duration: 3,
      type: "morning",
      date: today,
      completed: false,
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    });
    
    OfflineStorage.createRoutineItem({
      name: "🧼 Face Wash (Gentle Cleanser)",
      time: "06:20",
      duration: 5,
      type: "morning",
      date: today,
      completed: false, 
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    });
    
    // Evening routine
    OfflineStorage.createRoutineItem({
      name: "🧼 Evening Face & Body Cleansing",
      time: "21:00",
      duration: 10,
      type: "night",
      date: today,
      completed: false,
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] 
    });
    
    OfflineStorage.createRoutineItem({
      name: "💧 Face Serum (Vitamin C/Niacinamide)",
      time: "21:10",
      duration: 5,
      type: "night",
      date: today,
      completed: false,
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    });
    
    // Weekly routine
    OfflineStorage.createRoutineItem({
      name: "👄 Lip Scrub (Honey + Sugar)",
      time: "10:00",
      duration: 10,
      type: "weekly",
      date: today,
      completed: false,
      days: ["sunday"]
    });
    
    OfflineStorage.createRoutineItem({
      name: "💆‍♀️ Hair Oil Massage", 
      time: "19:00",
      duration: 20,
      type: "weekly",
      date: today,
      completed: false,
      days: ["saturday"]
    });
  }
  
  console.log('✅ Sample data initialized for offline use');
};