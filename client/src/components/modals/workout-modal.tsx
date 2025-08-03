import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Exercise, InsertExercise } from "@shared/schema";
import { getTodayString, getCurrentDayName, isCurrentDay } from "@/lib/date-utils";

interface WorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (exercise: InsertExercise) => void;
  exercise?: Exercise;
  isWeekly?: boolean;
}

export function WorkoutModal({ open, onOpenChange, onSave, exercise, isWeekly = false }: WorkoutModalProps) {
  const [formData, setFormData] = useState<InsertExercise>({
    name: exercise?.name || "",
    sets: exercise?.sets || 1,
    reps: exercise?.reps || "",
    duration: exercise?.duration || 30,
    completed: exercise?.completed || false,
    date: exercise?.date || getTodayString(),
    day: exercise?.day || getCurrentDayName() as any,
    workoutType: exercise?.workoutType || "",
    isWeekly: exercise?.isWeekly || isWeekly,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      name: "",
      sets: 1,
      reps: "",
      duration: 30,
      completed: false,
      date: getTodayString(),
      day: getCurrentDayName() as any,
      workoutType: "",
      isWeekly: isWeekly,
    });
  };

  const days = [
    { value: "sunday", label: "Sunday" },
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {exercise ? "Edit Exercise" : `Add New ${isWeekly ? "Weekly" : "Daily"} Exercise`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Exercise Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter exercise name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 1 })}
                min="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                value={formData.reps}
                onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                placeholder="e.g., 10 or 1 min"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              min="1"
            />
          </div>

          {isWeekly && (
            <div>
              <Label htmlFor="day">Day</Label>
              <Select value={formData.day} onValueChange={(value: any) => setFormData({ ...formData, day: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => {
                    const isToday = isCurrentDay(day.value);
                    return (
                      <SelectItem key={day.value} value={day.value} className={
                        isToday ? 'bg-blue-50 dark:bg-blue-900/20 font-semibold text-blue-700 dark:text-blue-300' : ''
                      }>
                        {day.label}
                        {isToday && (
                          <span className="ml-2 text-xs bg-blue-500 text-white px-1 py-0.5 rounded">Today</span>
                        )}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="workoutType">Workout Type (optional)</Label>
            <Input
              id="workoutType"
              value={formData.workoutType}
              onChange={(e) => setFormData({ ...formData, workoutType: e.target.value })}
              placeholder="e.g., Chest Day, Cardio"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isWeekly"
              checked={formData.isWeekly}
              onCheckedChange={(checked) => setFormData({ ...formData, isWeekly: !!checked })}
            />
            <Label htmlFor="isWeekly">Weekly Exercise</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {exercise ? "Update" : "Create"} Exercise
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
