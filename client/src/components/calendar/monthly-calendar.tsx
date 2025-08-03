import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { generateCalendarDates, getPerformanceColor } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface MonthlyCalendarProps {
  performanceData?: Record<string, number>;
  onDateClick?: (date: string) => void;
}

export function MonthlyCalendar({ performanceData = {}, onDateClick }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const calendarDates = generateCalendarDates(year, month);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="premium-card p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full"></div>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gradient-primary">📅 Monthly Progress</h3>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={previousMonth} className="premium-button h-12 w-12 rounded-xl">
            <ChevronLeft className="h-5 w-5 text-white" />
          </Button>
          <span className="text-xl font-bold text-gradient-primary px-6">{monthName}</span>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="premium-button h-12 w-12 rounded-xl">
            <ChevronRight className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-3 mb-6">
        {dayLabels.map((day) => (
          <div key={day} className="text-center font-bold text-gray-700 dark:text-gray-300 py-3 text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {calendarDates.map((dateObj, index) => {
          if (!dateObj) {
            return <div key={index} className="w-14 h-14" />;
          }

          const performance = performanceData[dateObj.dateString] || 0;

          return (
            <button
              key={dateObj.dateString}
              onClick={() => onDateClick?.(dateObj.dateString)}
              className={cn(
                "w-14 h-14 flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 font-bold text-sm relative overflow-hidden group hover:scale-110 hover:shadow-lg",
                dateObj.isToday
                  ? "bg-gradient-to-br from-primary to-accent text-white ring-4 ring-primary/30 ring-offset-2 dark:ring-offset-gray-800 shadow-lg scale-105"
                  : performance > 0
                  ? performance >= 80
                    ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md"
                    : performance >= 60
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md"
                    : "bg-gradient-to-br from-red-400 to-red-600 text-white shadow-md"
                  : "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-400 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <span className="relative z-10">{dateObj.day}</span>
            </button>
          );
        })}
      </div>

      {/* Performance Legend */}
      <div className="flex items-center justify-center flex-wrap gap-6 mt-8 text-sm">
        <div className="flex items-center space-x-3 premium-card px-4 py-2">
          <div className="w-5 h-5 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Excellent (80-100%)</span>
        </div>
        <div className="flex items-center space-x-3 premium-card px-4 py-2">
          <div className="w-5 h-5 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Good (60-79%)</span>
        </div>
        <div className="flex items-center space-x-3 premium-card px-4 py-2">
          <div className="w-5 h-5 rounded-xl bg-gradient-to-br from-red-400 to-red-600 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Poor (&lt;60%)</span>
        </div>
        <div className="flex items-center space-x-3 premium-card px-4 py-2">
          <div className="w-5 h-5 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">No Data</span>
        </div>
      </div>
    </div>
  );
}
