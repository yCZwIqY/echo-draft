export function formatDate(date: Date, format: string = 'yyyy-MM-dd HH:mm:ss'): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return format
    .replace('yyyy', String(year))
    .replace('YYYY', String(year))
    .replace('MM', String(month))
    .replace('dd', String(day))
    .replace('DD', String(day))
    .replace('HH', String(hour))
    .replace('hh', String(hour))
    .replace('mm', String(minute))
    .replace('ss', String(second))
    .replace('SS', String(second));
}
