import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MindActivity, InsertMindActivity } from "@shared/schema";
import { getTodayString } from "@/lib/date-utils";

interface MindActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (activity: InsertMindActivity) => void;
  activity?: MindActivity;
}

export function MindActivityModal({ open, onOpenChange, onSave, activity }: MindActivityModalProps) {
  const [formData, setFormData] = useState<InsertMindActivity>({
    name: activity?.name || "",
    description: activity?.description || "",
    time: activity?.time || "",
    chatgptRole: activity?.chatgptRole || "",
    completed: activity?.completed || false,
    date: activity?.date || getTodayString(),
    status: activity?.status || "pending",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      name: "",
      description: "",
      time: "",
      chatgptRole: "",
      completed: false,
      date: getTodayString(),
      status: "pending",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{activity ? "Edit Mind Activity" : "Add New Mind Activity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Activity Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter activity name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter activity description"
              required
            />
          </div>

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
            <Label htmlFor="chatgptRole">ChatGPT Role</Label>
            <Textarea
              id="chatgptRole"
              value={formData.chatgptRole}
              onChange={(e) => setFormData({ ...formData, chatgptRole: e.target.value })}
              placeholder="Describe how ChatGPT should assist with this activity"
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {activity ? "Update" : "Create"} Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
