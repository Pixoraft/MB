import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RoutineItem, InsertRoutineItem } from "@shared/schema";
import { getTodayString, isCurrentDay } from "@/lib/date-utils";

interface RoutineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (routine: InsertRoutineItem) => void;
  routine?: RoutineItem;
}

export function RoutineModal({ open, onOpenChange, onSave, routine }: RoutineModalProps) {
  const [formData, setFormData] = useState<InsertRoutineItem>({
    name: routine?.name || "",
    time: routine?.time || "",
    duration: routine?.duration || 30,
    type: routine?.type || "morning",
    days: routine?.days || [],
    completed: routine?.completed || false,
    date: routine?.date || getTodayString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      name: "",
      time: "",
      duration: 30,
      type: "morning",
      days: [],
      completed: false,
      date: getTodayString(),
    });
  };

  const weekDays = [
    { value: "sunday", label: "Sunday" },
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
  ];

  const handleDayToggle = (day: string, checked: boolean) => {
    const currentDays = formData.days || [];
    if (checked) {
      setFormData({ ...formData, days: [...currentDays, day as any] });
    } else {
      setFormData({ ...formData, days: currentDays.filter(d => d !== day) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{routine ? "Edit Routine" : "Add New Routine"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Routine Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter routine name"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Routine Type</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">☀️ Morning Routine</SelectItem>
                <SelectItem value="night">🌙 Night Routine</SelectItem>
                <SelectItem value="weekly">📆 Weekly Routine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                min="1"
                required
              />
            </div>
          </div>

          {formData.type === "weekly" && (
            <div>
              <Label>Select Days</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {weekDays.map((day) => {
                  const isToday = isCurrentDay(day.value);
                  return (
                    <div key={day.value} className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      isToday ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''
                    }`}>
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={(formData.days || []).includes(day.value as any)}
                        onCheckedChange={(checked) => handleDayToggle(day.value, !!checked)}
                      />
                      <Label htmlFor={`day-${day.value}`} className={`text-sm cursor-pointer ${
                        isToday ? 'font-semibold text-blue-700 dark:text-blue-300' : ''
                      }`}>
                        {day.label}
                        {isToday && (
                          <span className="ml-1 text-xs bg-blue-500 text-white px-1 py-0.5 rounded">Today</span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {routine ? "Update" : "Create"} Routine
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
