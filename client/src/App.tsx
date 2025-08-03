import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navigation } from "@/components/layout/navigation";
import Dashboard from "@/pages/dashboard";
import DailyTask from "@/pages/daily-task";
import Workout from "@/pages/workout";
import MindWorkout from "@/pages/mind-workout";
import DailyRoutine from "@/pages/daily-routine";
import Skincare from "@/pages/skincare";
import DevTracker from "@/pages/dev-tracker";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/daily-task" component={DailyTask} />
      <Route path="/workout" component={Workout} />
      <Route path="/mind-workout" component={MindWorkout} />
      <Route path="/daily-routine" component={DailyRoutine} />
      <Route path="/skincare" component={Skincare} />
      <Route path="/dev-tracker" component={DevTracker} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="metabuild-ui-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Router />
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
