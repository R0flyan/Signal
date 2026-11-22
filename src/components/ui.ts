import type { Marketplace, Priority } from '../domain/types.ts';
import { marketplaces } from '../mocks/data.ts';

export const esc = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const paths: Record<string, string> = {
  activity: '<path d="M2 12h5l3-9 4 18 3-9h5"/>',
  overview: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  topics: '<path d="m12 3 10 5-10 5L2 8l10-5Z"/><path d="m2 12 10 5 10-5M2 16l10 5 10-5"/>',
  reviews: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 3V11.5A8.5 8.5 0 0 1 9.5 3h3a8.5 8.5 0 0 1 8.5 8.5Z"/><path d="M7 9h9M7 13h6"/>',
  products: '<path d="m12 3 9 5v9l-9 5-9-5V8l9-5ZM3 8l9 5 9-5M12 13v9M7.5 5.5l9 5"/>',
  alerts: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  reports: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M8 17v-4M12 17v-6M16 17v-2"/>',
  connections: '<path d="m10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(1 0) scale(.9)"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="3" fill="currentColor" stroke="none"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 5 7 7-7 7"/>',
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2m4 0h2m-8 3h2"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3 2.5c-.5.2-.5 1-.5 1.5M12 17h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  warning: '<path d="m10.3 3.5-9 16A1 1 0 0 0 2.2 21h19.6a1 1 0 0 0 .9-1.5l-9-16a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01"/>',
  trend: '<path d="m3 17 6-6 4 4 8-10M15 5h6v6"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4"/>',
  shield: '<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z"/><path d="m8 12 3 3 5-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5 8a8 8 0 0 1 13-3l2 2M4 17l2 2a8 8 0 0 0 13-3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7ZM11 13 22 2"/>',
  cup: '<path d="M6 7h10l-1 14H7L6 7ZM5 4h12M7 2h8M16 8h2a3 3 0 0 1 0 6h-2"/>',
};
export function icon(name: string, size = 20): string { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.activity}</svg>`; }
export function marketBadge(m: Marketplace, full = false): string { return `<span class="market-badge market-${m}" title="${marketplaces[m].name}">${full ? marketplaces[m].name : marketplaces[m].short}</span>`; }
export function priorityBadge(priority: Priority): string { return `<span class="priority priority-${priority === 'Высокий' ? 'high' : priority === 'Средний' ? 'medium' : 'low'}"><i></i>${priority}</span>`; }
export function button(label: string, action: string, symbol = '', variant = '', attrs = ''): string { return `<button class="button ${variant}" data-action="${action}" ${attrs}>${symbol ? icon(symbol, 16) : ''}${label}</button>`; }
export function select(name: string, value: string | number, options: [string | number, string][], label: string, extra = ''): string { return `<span class="select-wrap ${extra}"><select name="${name}" aria-label="${label}">${options.map(([v, t]) => `<option value="${esc(v)}" ${String(value) === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>${icon('chevron', 15)}</span>`; }
export function search(value: string, placeholder: string, name: string): string { return `<label class="search-field">${icon('search', 17)}<input name="${name}" aria-label="${placeholder}" value="${esc(value)}" placeholder="${placeholder}" autocomplete="off" /></label>`; }
export function empty(title = 'Ничего не найдено', text = 'Попробуйте изменить фильтры или поисковый запрос.'): string { return `<div class="empty-state">${icon('search', 30)}<h3>${title}</h3><p>${text}</p></div>`; }
export const number = (n: number) => n.toLocaleString('ru-RU');
export function plural(n: number, one: string, few: string, many: string): string { const rem = Math.abs(n) % 100; return rem >= 11 && rem <= 14 ? many : rem % 10 === 1 ? one : rem % 10 >= 2 && rem % 10 <= 4 ? few : many; }
export function sparkline(values: number[], highlight = false): string {
  const max = Math.max(...values, 1), points = values.map((v, i) => `${i * 14 + 2},${34 - v / max * 27}`).join(' ');
  return `<svg class="sparkline" width="104" height="40" viewBox="0 0 104 40" role="img" aria-label="Динамика: ${values.join(', ')}"><polygon points="2,40 ${points} 100,40" fill="${highlight ? '#eeecff' : '#f5f3ff'}"/><polyline points="${points}" stroke="${highlight ? '#4f46e5' : '#a69af0'}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="100" cy="${34 - (values.at(-1) ?? 0) / max * 27}" r="2.5" fill="${highlight ? '#4f46e5' : '#a69af0'}"/></svg>`;
}
