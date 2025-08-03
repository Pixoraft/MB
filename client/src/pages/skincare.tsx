import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart } from "@/components/charts/pie-chart";
import { FloatingButton } from "@/components/ui/floating-button";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { SkincareModal } from "../components/modals/skincare-modal";
import { SkincareItem, InsertSkincareItem } from "@shared/schema";
import { getTodayString, calculatePerformance } from "@/lib/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Skincare() {
  const [showSkincareModal, setShowSkincareModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SkincareItem | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = getTodayString();

  // Fetch skincare items by category
  const { data: dailyMorningItems = [] } = useQuery({
    queryKey: ["/api/skincare-items", "daily-morning"],
    queryFn: async () => {
      const response = await fetch("/api/skincare-items?category=daily-morning");
      return response.json();
    },
  });

  const { data: dailyEveningItems = [] } = useQuery({
    queryKey: ["/api/skincare-items", "daily-evening"],
    queryFn: async () => {
      const response = await fetch("/api/skincare-items?category=daily-evening");
      return response.json();
    },
  });

  const { data: threeTimesWeekItems = [] } = useQuery({
    queryKey: ["/api/skincare-items", "3x-week"],
    queryFn: async () => {
      const response = await fetch("/api/skincare-items?category=3x-week");
      return response.json();
    },
  });

  const { data: twoTimesWeekItems = [] } = useQuery({
    queryKey: ["/api/skincare-items", "2x-week"],
    queryFn: async () => {
      const response = await fetch("/api/skincare-items?category=2x-week");
      return response.json();
    },
  });

  const { data: weeklyItems = [] } = useQuery({
    queryKey: ["/api/skincare-items", "weekly"],
    queryFn: async () => {
      const response = await fetch("/api/skincare-items?category=weekly");
      return response.json();
    },
  });

  // Default skincare routine data
  const defaultSkincareRoutine: InsertSkincareItem[] = [
    // Daily Morning Routine
    {
      name: "Lemon & Honey Detox Drink",
      description: "Start your day with this detoxifying drink on empty stomach",
      ingredients: ["½ Lemon (Freshly Squeezed)", "1 tsp Honey (Pure & Organic)", "1 Glass (250ml) Warm Water"],
      instructions: "Mix lemon juice and honey in warm water. Drink immediately before eating anything.",
      duration: 5,
      category: "daily-morning",
      frequency: "Daily",
      date: today,
      benefits: ["Detoxifies body", "Boosts metabolism", "Improves digestion"],
      order: 1,
      completed: false,
    },
    {
      name: "Ice Cube Face Treatment",
      description: "Rub ice cubes on face to tighten pores and brighten skin",
      instructions: "Rub ice cubes gently on face for 1-2 minutes to tighten pores and brighten skin.",
      duration: 2,
      category: "daily-morning",
      frequency: "Daily",
      date: today,
      benefits: ["Tightens pores", "Brightens skin", "Reduces puffiness"],
      order: 2,
      completed: false,
    },
    {
      name: "Face & Body Wash",
      description: "Use Vitamin C face wash and tan-removal body wash",
      instructions: "Use Vitamin C face wash for face and Ubtan or Kojic Acid Soap for body to remove tan.",
      duration: 5,
      category: "daily-morning",
      frequency: "Daily",
      date: today,
      benefits: ["Removes tan", "Cleanses skin", "Vitamin C benefits"],
      order: 3,
      completed: false,
    },
    {
      name: "Malai + Honey + Haldi Face Pack",
      description: "Natural face pack for hydration and tan removal",
      ingredients: ["1 tbsp Honey", "1 tbsp Malai (Fresh Cream)", "½ tsp Turmeric (Haldi)"],
      instructions: "Mix all ingredients and apply on face and neck for 15-20 minutes, then wash off.",
      duration: 20,
      category: "daily-morning",
      frequency: "Daily",
      date: today,
      benefits: ["Hydrates skin", "Removes tan", "Natural glow", "Anti-inflammatory"],
      order: 4,
      completed: false,
    },
    {
      name: "Moisturize & Sun Protection",
      description: "Apply moisturizer and sunscreen for protection",
      instructions: "Apply Aloe Vera Gel/Coconut Oil followed by SPF 50+ sunscreen on exposed areas.",
      duration: 3,
      category: "daily-morning",
      frequency: "Daily",
      date: today,
      benefits: ["Moisturizes skin", "Sun protection", "Prevents aging"],
      order: 5,
      completed: false,
    },

    // Daily Evening Routine
    {
      name: "Evening Face & Body Cleansing",
      description: "Remove day's impurities with gentle cleansing",
      instructions: "Use same face wash and body wash as morning routine to remove dirt and pollutants.",
      duration: 5,
      category: "daily-evening",
      frequency: "Daily",
      date: today,
      benefits: ["Removes impurities", "Cleanses pores", "Prepares skin for treatment"],
      order: 1,
      completed: false,
    },
    {
      name: "Face Serum Application",
      description: "Apply Vitamin C or Niacinamide serum for dark spots",
      instructions: "Apply Vitamin C/Niacinamide serum to remove dark spots and improve skin texture.",
      duration: 2,
      category: "daily-evening",
      frequency: "Daily",
      date: today,
      benefits: ["Reduces dark spots", "Improves skin texture", "Anti-aging"],
      order: 2,
      completed: false,
    },
    {
      name: "Night Moisturizer",
      description: "Deep moisturizing treatment for overnight repair",
      instructions: "Use Aloe Vera Gel/Vitamin E Oil/Almond Oil before sleeping for overnight nourishment.",
      duration: 2,
      category: "daily-evening",
      frequency: "Daily",
      date: today,
      benefits: ["Deep moisturizing", "Overnight repair", "Nourishes skin"],
      order: 3,
      completed: false,
    },
    {
      name: "Milk & Potato Remedy for Dark Areas",
      description: "Natural remedy for dark spots and areas",
      ingredients: ["1 grated potato", "2 tbsp raw milk"],
      instructions: "Grate 1 potato, mix with 2 tbsp raw milk. Apply for 20 minutes, then wash off.",
      duration: 20,
      category: "daily-evening",
      frequency: "Daily",
      date: today,
      benefits: ["Lightens dark areas", "Natural bleaching", "Evens skin tone"],
      order: 4,
      completed: false,
    },

    // 3x a Week (Alternate Days)
    {
      name: "Lip Scrub Treatment",
      description: "Remove tan and dead skin from lips",
      ingredients: ["1 tsp Honey", "1 tsp Sugar"],
      instructions: "Mix honey and sugar. Scrub lips gently for 2-3 minutes to remove tan and dead skin.",
      duration: 5,
      category: "3x-week",
      frequency: "Tues, Thurs, Sat",
      date: today,
      benefits: ["Removes dead skin", "Softens lips", "Removes tan from lips"],
      order: 1,
      completed: false,
    },
    {
      name: "Body Exfoliation",
      description: "Scrub dark areas for smooth skin",
      ingredients: ["Coffee + Curd", "OR Sugar + Honey"],
      instructions: "Scrub dark areas (hands, neck, back, feet, intimate parts) using coffee + curd or sugar + honey for 5 minutes, then rinse.",
      duration: 10,
      category: "3x-week",
      frequency: "Sun, Wed, Fri",
      date: today,
      benefits: ["Removes dead skin", "Lightens dark areas", "Improves circulation"],
      order: 2,
      completed: false,
    },
    {
      name: "Ubtan Body Mask",
      description: "Traditional Indian body mask for tan removal",
      ingredients: ["2 tbsp Gram Flour (Besan)", "1 tbsp Turmeric", "1 tbsp Lemon Juice", "2 tbsp Curd", "1 tbsp Honey", "Rose Water"],
      instructions: "Mix all ingredients with rose water to make paste. Apply for 20-30 minutes, scrub gently, then wash off.",
      duration: 35,
      category: "3x-week",
      frequency: "Tues, Thurs, Sat",
      date: today,
      benefits: ["Removes tan", "Traditional ayurvedic treatment", "Natural glow", "Deep cleansing"],
      order: 3,
      completed: false,
    },
    {
      name: "Lemon & Baking Soda Treatment",
      description: "For underarms and private areas",
      ingredients: ["½ Lemon Juice", "1 tsp Baking Soda"],
      instructions: "Mix lemon juice with baking soda. Apply for 5 minutes on underarms and private areas, then wash off. Removes darkness and bad smell.",
      duration: 8,
      category: "3x-week",
      frequency: "Mon, Fri",
      date: today,
      benefits: ["Removes darkness", "Eliminates odor", "Lightening effect"],
      order: 4,
      completed: false,
    },

    // 2x a Week (Hair Care Days)
    {
      name: "Hair Oil Massage",
      description: "Strengthens hair and prevents hair fall",
      ingredients: ["Coconut Oil", "Castor Oil", "Amla Oil"],
      instructions: "Use Coconut Oil + Castor Oil for thickness, or Amla Oil for strength and black color. Massage for 5-10 minutes, leave for 1 hour before washing.",
      duration: 70,
      category: "2x-week",
      frequency: "Wed & Sat OR Sun & Thurs",
      date: today,
      benefits: ["Strengthens hair", "Prevents hair fall", "Promotes thickness", "Maintains natural color"],
      order: 1,
      completed: false,
    },
    {
      name: "Hair Wash with Sulfate-Free Shampoo",
      description: "Gentle hair cleansing (DO NOT wash daily)",
      instructions: "Use mild, sulfate-free shampoo (Aloe Vera/Amla-based). Wash with lukewarm or cold water, never hot water.",
      duration: 15,
      category: "2x-week",
      frequency: "Wed & Sat OR Sun & Thurs",
      date: today,
      benefits: ["Gentle cleansing", "Maintains natural oils", "Prevents damage"],
      order: 2,
      completed: false,
    },
  ];

  // Initialize default skincare routine
  const initializeSkincareRoutine = useMutation({
    mutationFn: async () => {
      const promises = defaultSkincareRoutine.map(item => 
        apiRequest("POST", "/api/skincare-items", item)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skincare-items"] });
      setIsInitialized(true);
      toast({ title: "Skincare routine initialized successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to initialize skincare routine", variant: "destructive" });
    },
  });

  // Check if we need to initialize the routine
  useEffect(() => {
    const totalItems = dailyMorningItems.length + dailyEveningItems.length + 
                     threeTimesWeekItems.length + twoTimesWeekItems.length + weeklyItems.length;
    
    if (totalItems === 0 && !isInitialized) {
      initializeSkincareRoutine.mutate();
    }
  }, [dailyMorningItems, dailyEveningItems, threeTimesWeekItems, twoTimesWeekItems, weeklyItems, isInitialized]);

  // CRUD mutations
  const createSkincareItemMutation = useMutation({
    mutationFn: async (newItem: InsertSkincareItem) => {
      const response = await apiRequest("POST", "/api/skincare-items", newItem);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skincare-items"] });
      toast({ title: "Skincare item created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create skincare item", variant: "destructive" });
    },
  });

  const updateSkincareItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SkincareItem> }) => {
      const response = await apiRequest("PATCH", `/api/skincare-items/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skincare-items"] });
      toast({ title: "Skincare item updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update skincare item", variant: "destructive" });
    },
  });

  const deleteSkincareItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/skincare-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skincare-items"] });
      toast({ title: "Skincare item deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete skincare item", variant: "destructive" });
    },
  });

  // Calculate completion rates
  const allItems = [...dailyMorningItems, ...dailyEveningItems, ...threeTimesWeekItems, ...twoTimesWeekItems, ...weeklyItems];
  const completedItems = allItems.filter((item: SkincareItem) => item.completed).length;
  const overallCompletionRate = calculatePerformance(completedItems, allItems.length);

  const completedMorning = dailyMorningItems.filter((item: SkincareItem) => item.completed).length;
  const morningCompletionRate = calculatePerformance(completedMorning, dailyMorningItems.length);

  const completedEvening = dailyEveningItems.filter((item: SkincareItem) => item.completed).length;
  const eveningCompletionRate = calculatePerformance(completedEvening, dailyEveningItems.length);

  const completed3xWeek = threeTimesWeekItems.filter((item: SkincareItem) => item.completed).length;
  const threeTimesCompletionRate = calculatePerformance(completed3xWeek, threeTimesWeekItems.length);

  const handleItemToggle = (item: SkincareItem) => {
    updateSkincareItemMutation.mutate({
      id: item.id,
      updates: { completed: !item.completed }
    });
  };

  const handleEditItem = (item: SkincareItem) => {
    setEditingItem(item);
    setShowSkincareModal(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm("Are you sure you want to delete this skincare item?")) {
      deleteSkincareItemMutation.mutate(itemId);
    }
  };

  const handleSaveItem = (itemData: InsertSkincareItem) => {
    if (editingItem) {
      updateSkincareItemMutation.mutate({
        id: editingItem.id,
        updates: itemData
      });
    } else {
      createSkincareItemMutation.mutate(itemData);
    }
    setEditingItem(undefined);
  };

  const SkincareSection = ({ 
    title, 
    icon, 
    items, 
    emptyMessage,
    description 
  }: { 
    title: string; 
    icon: string; 
    items: SkincareItem[]; 
    emptyMessage: string;
    description: string;
  }) => (
    <Card className="premium-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full"></div>
      <CardHeader>
        <CardTitle className="flex items-center space-x-3 text-2xl text-gradient-primary">
          <span className="text-3xl">{icon}</span>
          <div className="flex-1">
            <div>{title}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">{description}</p>
          </div>
          <span className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary dark:text-accent text-sm font-bold px-3 py-1 rounded-full">
            {items.length} steps
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">{icon}</span>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">{emptyMessage}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Click the + button to add your first step!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item: SkincareItem) => (
              <div
                key={item.id}
                className="skincare-item premium-card p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-start space-x-4 flex-1">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => handleItemToggle(item)}
                      className="w-6 h-6 border-2 border-primary/30 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:to-accent mt-1"
                    />
                    <div className="flex-1">
                      <div className={`text-lg font-semibold ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'} transition-colors mb-2`}>
                        {item.name}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                      )}
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 font-medium mb-3">
                        <span className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary dark:text-accent px-2 py-1 rounded-lg font-bold">
                          ⏱️ {item.duration} min
                        </span>
                        <span className="bg-gradient-to-r from-secondary/20 to-accent/20 text-secondary dark:text-accent px-2 py-1 rounded-lg font-bold">
                          📅 {item.frequency}
                        </span>
                      </div>
                      {item.ingredients && item.ingredients.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ingredients:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.ingredients.map((ingredient, index) => (
                              <Badge key={index} className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 dark:text-blue-300 text-xs">
                                {ingredient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {item.benefits && item.benefits.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Benefits:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.benefits.map((benefit, index) => (
                              <Badge key={index} className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 text-xs">
                                ✨ {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="font-medium mb-1">Instructions:</p>
                        <p>{item.instructions}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <Badge className={item.completed 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg border-0 font-semibold px-4 py-2" 
                      : "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg border-0 font-semibold px-4 py-2"
                    }>
                      {item.completed ? "✅ Done" : "⏸️ Pending"}
                    </Badge>
                    <ThreeDotMenu
                      onEdit={() => handleEditItem(item)}
                      onDelete={() => handleDeleteItem(item.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-black text-gradient-primary mb-4">✨ Skincare & Haircare Routine</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Complete skincare, haircare & hygiene routine for bright skin, strong hair, and fresh smell without confusion
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-6"></div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="premium-card p-6 text-center">
            <div className="text-3xl font-black text-gradient-primary mb-2">{overallCompletionRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
          </div>
          <div className="premium-card p-6 text-center">
            <div className="text-3xl font-black text-gradient-secondary mb-2">{morningCompletionRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">☀️ Morning</div>
          </div>
          <div className="premium-card p-6 text-center">
            <div className="text-3xl font-black text-gradient-primary mb-2">{eveningCompletionRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">🌙 Evening</div>
          </div>
          <div className="premium-card p-6 text-center">
            <div className="text-3xl font-black text-gradient-secondary mb-2">{threeTimesCompletionRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">📆 Weekly</div>
          </div>
        </div>

        {/* Routine Sections */}
        <Tabs defaultValue="daily" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily Routine</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Routine</TabsTrigger>
            <TabsTrigger value="tips">Diet & Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-8">
            <SkincareSection
              title="Morning Routine"
              icon="☀️"
              description="Start your day with these 5 essential steps for glowing skin"
              items={dailyMorningItems}
              emptyMessage="No morning skincare routine set up."
            />

            <SkincareSection
              title="Evening Routine"
              icon="🌙"
              description="Night routine for skin repair and rejuvenation while you sleep"
              items={dailyEveningItems}
              emptyMessage="No evening skincare routine set up."
            />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-8">
            <SkincareSection
              title="3x a Week (Alternate Days)"
              icon="🔄"
              description="Tues, Thurs, Sat / Sun, Wed, Fri - Deep cleansing and exfoliation"
              items={threeTimesWeekItems}
              emptyMessage="No 3x weekly routine set up."
            />

            <SkincareSection
              title="2x a Week (Hair Care Days)"
              icon="💇‍♀️"
              description="Wed & Sat OR Sun & Thurs - Hair strengthening and care"
              items={twoTimesWeekItems}
              emptyMessage="No hair care routine set up."
            />
          </TabsContent>

          <TabsContent value="tips">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Diet Tips */}
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-gradient-primary flex items-center space-x-3">
                    <span className="text-3xl">🥗</span>
                    <span>Diet for Glowing Skin & Strong Hair</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center">
                      <span className="mr-2">✅</span> Eat More of These
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-orange-100 text-orange-800">Vitamin C</Badge>
                        <span>Orange, Lemon, Amla, Papaya, Tomato</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">Carotene</Badge>
                        <span>Carrots, Spinach, Sweet Potatoes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-100 text-blue-800">Collagen</Badge>
                        <span>Almonds, Walnuts, Coconut Water, Cucumber</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-purple-100 text-purple-800">Iron & Biotin</Badge>
                        <span>Spinach, Almonds, Walnuts, Eggs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-cyan-100 text-cyan-800">Hydration</Badge>
                        <span>3-4 liters of water daily</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
                      <span className="mr-2">❌</span> Avoid These
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>• Too much sugar & junk food (causes dull skin & hair fall)</p>
                      <p>• Oily & fried food (clogs pores & weakens hair roots)</p>
                      <p>• Excess caffeine (Tea/Coffee) - Switch to Green Tea</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">💪 Hair Strengthening Drink</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Drink Amla Juice or Coconut Water every morning for thick & black hair
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Hygiene & Tips */}
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-gradient-primary flex items-center space-x-3">
                    <span className="text-3xl">🧼</span>
                    <span>Hygiene & Important Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">🚿 Daily Hygiene</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>• Shower twice a day with antibacterial soap</p>
                      <p>• Use loofah & antibacterial soap (Neem, Charcoal, Tea Tree)</p>
                      <p>• Change socks, underwear & shirts daily</p>
                      <p>• Use talcum powder after bath to stay dry & fresh</p>
                      <p>• Apply deodorant/perfume (alcohol-free preferred)</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-3">⚡ Fast Results Tips</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>• Wear full sleeves & apply sunscreen daily</p>
                      <p>• Use ice cubes on face daily for glow & tight pores</p>
                      <p>• Sleep 7-8 hours for skin & hair repair</p>
                      <p>• Workout daily - sweat removes toxins</p>
                      <p>• Drink more water to flush out body odor toxins</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">🔥 Expected Results</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Results in 2-4 weeks if followed properly:</strong>
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>✓ Glowing & bright skin</p>
                      <p>✓ No tanning & dark patches</p>
                      <p>✓ Fresh smell all day</p>
                      <p>✓ Thick, black & healthy hair</p>
                      <p>✓ No bad body odor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Floating Add Button */}
        <FloatingButton
          onClick={() => {
            setEditingItem(undefined);
            setShowSkincareModal(true);
          }}
        />

        {/* Skincare Modal */}
        <SkincareModal
          open={showSkincareModal}
          onOpenChange={setShowSkincareModal}
          onSave={handleSaveItem}
          item={editingItem}
        />
      </div>
    </div>
  );
}