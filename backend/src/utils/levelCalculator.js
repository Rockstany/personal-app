export function calculateDurationLevel(consecutiveDays) {
  if (consecutiveDays < 0) return 0;
  return Math.min(Math.floor(consecutiveDays / 10), 9);
}

export function calculateNumericLevel(currentProgress, targetValue) {
  if (targetValue <= 0) return 0;
  const percentage = (currentProgress / targetValue) * 100;
  return Math.min(Math.floor(percentage / 10), 9);
}

export function getSkipDaysForLevel(level) {
  return Math.max(0, level);
}

export function formatDate(date) {
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date;
  }
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getToday() {
  return formatDate(new Date());
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return formatDate(result);
}
