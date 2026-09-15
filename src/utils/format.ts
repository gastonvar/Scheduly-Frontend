export function formatCurrency(amount: number): string {
  const value = new Intl.NumberFormat('es-UY', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);

  return `$${value} UYU`;
}

const dateFormatOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-UY', dateFormatOptions).format(new Date(isoDate));
}

export function formatDateFromDate(date: Date): string {
  return new Intl.DateTimeFormat('es-UY', dateFormatOptions).format(date);
}

const timeFormatOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  hour12: false,
  minute: '2-digit',
};

export function formatTime(isoDate: string): string {
  return new Intl.DateTimeFormat('es-UY', timeFormatOptions).format(new Date(isoDate));
}

export function formatTimeFromDate(date: Date): string {
  return new Intl.DateTimeFormat('es-UY', timeFormatOptions).format(date);
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTimeFromDate(start)} – ${formatTimeFromDate(end)}`;
}
