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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📅 Monthly Progress</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium px-4">{monthName}</span>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayLabels.map((day) => (
          <div key={day} className="text-center font-medium text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDates.map((dateObj, index) => {
          if (!dateObj) {
            return <div key={index} className="w-12 h-12" />;
          }

          const performance = performanceData[dateObj.dateString] || 0;
          const performanceClass = getPerformanceColor(performance);

          return (
            <button
              key={dateObj.dateString}
              onClick={() => onDateClick?.(dateObj.dateString)}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer transition-colors font-medium",
                dateObj.isToday
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800"
                  : performance > 0
                  ? `text-white ${
                      performance >= 80
                        ? "bg-green-500"
                        : performance >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              )}
            >
              {dateObj.day}
            </button>
          );
        })}
      </div>

      {/* Performance Legend */}
      <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Excellent (80-100%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-yellow-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Good (60-79%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Poor (&lt;60%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600"></div>
          <span className="text-gray-600 dark:text-gray-400">No Data</span>
        </div>
      </div>
    </div>
  );
}
