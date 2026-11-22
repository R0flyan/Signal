import type { Filters, Review, Topic } from './types.ts';

export function filterReviews(reviews: Review[], filters: Filters, now: string): Review[] {
  const end = Date.parse(now);
  const endOfDay = Date.parse(`${now.slice(0, 10)}T23:59:59.999+03:00`);
  const start = Date.parse(`${now.slice(0, 10)}T00:00:00+03:00`) - (filters.days - 1) * 86400000;
  if (!Number.isFinite(end)) return [];
  return reviews.filter(r => Date.parse(r.publishedAt) >= start && Date.parse(r.publishedAt) <= endOfDay && (filters.marketplace === 'all' || r.marketplace === filters.marketplace) && (filters.productId === 'all' || r.productId === filters.productId));
}

export function summarize(reviews: Review[], topics: Topic[]) {
  const negative = reviews.filter(r => r.rating <= 3);
  const grouped = negative.filter(r => r.topicId !== null);
  const active = topics.filter(t => grouped.some(r => r.topicId === t.id));
  return { total: reviews.length, negative: negative.length, negativePercent: reviews.length ? Math.round(negative.length / reviews.length * 100) : 0, topics: active.length, explainedPercent: negative.length ? Math.round(grouped.length / negative.length * 100) : 0, average: reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0 };
}

export function weeklyCounts(reviews: Review[], topicId: string, now: string): number[] {
  const last = Date.parse(`${now.slice(0, 10)}T23:59:59.999+03:00`);
  const first = last - 56 * 86400000 + 1;
  const result = Array<number>(8).fill(0);
  reviews.filter(r => r.topicId === topicId).forEach(r => {
    const index = Math.floor((Date.parse(r.publishedAt) - first) / (7 * 86400000));
    if (index >= 0 && index < 8) result[index]++;
  });
  return result;
}

export function csvCell(value: unknown): string {
  // Spreadsheet formulas must remain plain text in exported user content.
  const raw = String(value ?? '');
  const safe = /^[\s]*[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function makeCsv(headers: string[], rows: unknown[][]): string {
  return '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(';')).join('\r\n');
}
