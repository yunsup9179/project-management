export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getDaysBetween(start: Date, end: Date): number {
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getMonthsBetween(start: Date, end: Date): Array<{ name: string; days: number; flex: number }> {
  const months: Array<{ name: string; days: number; flex: number }> = [];
  const current = new Date(start);
  const totalDays = getDaysBetween(start, end);

  while (current <= end) {
    const monthStart = new Date(current);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const actualEnd = monthEnd > end ? end : monthEnd;

    const daysInRange = getDaysBetween(
      monthStart < start ? start : monthStart,
      actualEnd
    ) + 1;

    const monthName = current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase();

    months.push({
      name: monthName,
      days: daysInRange,
      flex: daysInRange / totalDays
    });

    current.setMonth(current.getMonth() + 1);
    current.setDate(1);
  }

  return months;
}

export function calculateBarPosition(
  taskStart: string,
  taskEnd: string,
  projectStart: Date,
  projectEnd: Date
): { left: number; width: number } {
  const totalDays = getDaysBetween(projectStart, projectEnd);
  const start = parseDate(taskStart);
  const end = parseDate(taskEnd);

  const daysFromStart = getDaysBetween(projectStart, start);
  const duration = getDaysBetween(start, end) + 1;

  return {
    left: (daysFromStart / totalDays) * 100,
    width: (duration / totalDays) * 100
  };
}
