export function dailyNoteTitle(date: Date): string {
  const now = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  const prefix = date.getFullYear() === now.getFullYear() ? '' : `${date.getFullYear()}年`;
  return `${prefix}${month}月${day}日 ${weekday}`;
}
