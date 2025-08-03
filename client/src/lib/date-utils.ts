import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameMonth } from "date-fns";

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDateDisplay(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

export function getWeekDates(date: Date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function getDaysOfWeek() {
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
}

export function getCurrentDayName(): string {
  return getDaysOfWeek()[new Date().getDay()];
}

export function isCurrentDay(dayName: string): boolean {
  return getCurrentDayName() === dayName;
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function calculatePerformance(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getPerformanceColor(percentage: number): string {
  if (percentage >= 80) return 'performance-excellent';
  if (percentage >= 60) return 'performance-good';
  if (percentage > 0) return 'performance-poor';
  return 'performance-no-data';
}

export function generateCalendarDates(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay(); // 0 = Sunday

  const dates = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startDay; i++) {
    dates.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    dates.push({
      date,
      day,
      isToday: isToday(date),
      isCurrentMonth: isSameMonth(date, firstDay),
      dateString: formatDate(date)
    });
  }

  return dates;
}
