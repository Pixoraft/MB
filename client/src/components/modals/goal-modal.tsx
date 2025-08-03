import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Goal, InsertGoal } from "@shared/schema";
import { format, addWeeks, addMonths, addYears } from "date-fns";

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (goal: InsertGoal) => void;
  goal?: Goal;
}

export function GoalModal({ open, onOpenChange, onSave, goal }: GoalModalProps) {
  const [formData, setFormData] = useState<InsertGoal>({
    title: goal?.title || "",
    description: goal?.description || "",
    type: goal?.type || "weekly",
    targetDate: goal?.targetDate || getDefaultTargetDate("weekly"),
    completed: goal?.completed || false,
    progress: goal?.progress || 0,
    parentGoalId: goal?.parentGoalId || undefined,
  });

  function getDefaultTargetDate(type: string): string {
    const today = new Date();
    switch (type) {
      case "weekly":
        return format(addWeeks(today, 1), "yyyy-MM-dd");
      case "monthly":
        return format(addMonths(today, 1), "yyyy-MM-dd");
      case "yearly":
        return format(addYears(today, 1), "yyyy-MM-dd");
      default:
        return format(addWeeks(today, 1), "yyyy-MM-dd");
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      title: "",
      description: "",
      type: "weekly",
      targetDate: getDefaultTargetDate("weekly"),
      completed: false,
      progress: 0,
      parentGoalId: undefined,
    });
  };

  const handleTypeChange = (type: string) => {
    setFormData({
      ...formData,
      type: type as any,
      targetDate: getDefaultTargetDate(type),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter goal title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter goal description"
            />
          </div>

          <div>
            <Label htmlFor="type">Goal Type</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">🗓️ Weekly Goal</SelectItem>
                <SelectItem value="monthly">📅 Monthly Goal</SelectItem>
                <SelectItem value="yearly">📈 Yearly Goal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {goal ? "Update" : "Create"} Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
