import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { SkincareItem, InsertSkincareItem, insertSkincareItemSchema } from "@shared/schema";
import { getTodayString } from "@/lib/date-utils";

interface SkincareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: InsertSkincareItem) => void;
  item?: SkincareItem;
}

export function SkincareModal({ open, onOpenChange, onSave, item }: SkincareModalProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  
  const form = useForm<InsertSkincareItem>({
    resolver: zodResolver(insertSkincareItemSchema),
    defaultValues: {
      name: "",
      description: "",
      instructions: "",
      duration: 5,
      category: "daily-morning",
      frequency: "Daily",
      date: getTodayString(),
      order: 0,
      completed: false,
    },
  });

  // Update form when editing an existing item
  useEffect(() => {
    if (item && open) {
      form.reset({
        name: item.name,
        description: item.description || "",
        instructions: item.instructions,
        duration: item.duration,
        category: item.category,
        frequency: item.frequency,
        date: item.date,
        order: item.order,
        completed: item.completed,
      });
      setIngredients(item.ingredients || []);
      setBenefits(item.benefits || []);
    } else if (!item && open) {
      form.reset({
        name: "",
        description: "",
        instructions: "",
        duration: 5,
        category: "daily-morning",
        frequency: "Daily",
        date: getTodayString(),
        order: 0,
        completed: false,
      });
      setIngredients([]);
      setBenefits([]);
    }
  }, [item, open, form]);

  const onSubmit = (data: InsertSkincareItem) => {
    const itemData = {
      ...data,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
    };
    onSave(itemData);
    onOpenChange(false);
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const removeBenefit = (benefit: string) => {
    setBenefits(benefits.filter(b => b !== benefit));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient-primary">
            {item ? "Edit Skincare Step" : "Add New Skincare Step"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Step Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Face Wash" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of this step" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily-morning">Daily Morning</SelectItem>
                        <SelectItem value="daily-evening">Daily Evening</SelectItem>
                        <SelectItem value="3x-week">3x Week</SelectItem>
                        <SelectItem value="2x-week">2x Week (Hair Care)</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Daily, Mon/Wed/Fri" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order (0 = first) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ingredients Section */}
            <div className="space-y-3">
              <FormLabel>Ingredients</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an ingredient"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                />
                <Button type="button" onClick={addIngredient} size="sm">
                  Add
                </Button>
              </div>
              {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                      {ingredient}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeIngredient(ingredient)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Benefits Section */}
            <div className="space-y-3">
              <FormLabel>Benefits</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a benefit"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                />
                <Button type="button" onClick={addBenefit} size="sm">
                  Add
                </Button>
              </div>
              {benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {benefits.map((benefit, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 flex items-center gap-1">
                      {benefit}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeBenefit(benefit)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed instructions on how to perform this step..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
                {item ? "Update Step" : "Add Step"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}