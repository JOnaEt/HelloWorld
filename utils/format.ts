export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length).trim()}…`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str
    .split(' ')
    .map((w) => capitalize(w))
    .join(' ');
}

export function slugToTitle(slug: string): string {
  return titleCase(slug.replace(/-/g, ' '));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('');
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
  return phone;
}

export function formatScripture(book: string, chapter: number, verses: string): string {
  return `${book} ${chapter}:${verses}`;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    faith: 'Faith',
    prayer: 'Prayer',
    worship: 'Worship',
    leadership: 'Leadership',
    family: 'Family',
    evangelism: 'Evangelism',
    healing: 'Healing',
    prophetic: 'Prophetic',
    discipleship: 'Discipleship',
    missions: 'Missions',
    'bible-study': 'Bible Study',
    youth: 'Youth',
    women: 'Women',
    men: 'Men',
    couples: 'Couples',
    singles: 'Singles',
    outreach: 'Outreach',
  };
  return labels[category] ?? slugToTitle(category);
}
