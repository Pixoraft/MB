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
    <div className="premium-card p-3 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full"></div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-3">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient-primary">📅 Monthly Progress</h3>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" size="icon" onClick={previousMonth} className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
          </Button>
          <span className="text-sm sm:text-lg lg:text-xl font-bold text-gradient-primary px-2 sm:px-4 lg:px-6">{monthName}</span>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3 mb-3 sm:mb-4 lg:mb-6">
        {dayLabels.map((day) => (
          <div key={day} className="text-center font-bold text-gray-700 dark:text-gray-300 py-1 sm:py-2 lg:py-3 text-xs sm:text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
        {calendarDates.map((dateObj, index) => {
          if (!dateObj) {
            return <div key={index} className="w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14" />;
          }

          const performance = performanceData[dateObj.dateString] || 0;

          return (
            <button
              key={dateObj.dateString}
              onClick={() => onDateClick?.(dateObj.dateString)}
              className={cn(
                "w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-lg sm:rounded-xl lg:rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs sm:text-sm relative overflow-hidden group hover:scale-110 hover:shadow-lg",
                dateObj.isToday
                  ? "bg-gradient-to-br from-primary to-accent text-white ring-2 sm:ring-4 ring-primary/30 ring-offset-1 sm:ring-offset-2 dark:ring-offset-gray-800 shadow-lg scale-105"
                  : performance > 0
                  ? performance >= 80
                    ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md"
                    : performance >= 60
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md"
                    : "bg-gradient-to-br from-red-400 to-red-600 text-white shadow-md"
                  : "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-400 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl lg:rounded-2xl"></div>
              <span className="relative z-10">{dateObj.day}</span>
            </button>
          );
        })}
      </div>

      {/* Performance Legend */}
      <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 lg:mt-8 text-xs sm:text-sm">
        <div className="flex items-center space-x-1 sm:space-x-2 bg-white dark:bg-gray-800 px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-sm">
          <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-lg bg-gradient-to-br from-green-400 to-green-600 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Excellent</span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 bg-white dark:bg-gray-800 px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-sm">
          <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Good</span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 bg-white dark:bg-gray-800 px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-sm">
          <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-lg bg-gradient-to-br from-red-400 to-red-600 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Poor</span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 bg-white dark:bg-gray-800 px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-sm">
          <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">No Data</span>
        </div>
      </div>
    </div>
  );
}
