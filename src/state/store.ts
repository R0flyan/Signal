import type { Filters, Marketplace, Review, TopicWork } from '../domain/types.ts';
import { mockReviewRepository } from '../data/reviewRepository.ts';
import { filterReviews } from '../domain/analytics.ts';
import { DEMO_NOW } from '../mocks/data.ts';

interface Saved {
  excluded: string[];
  work: Record<string, TopicWork>;
  read: string[];
  connections: Marketplace[];
  settings: { newTopic: boolean; growth: boolean; weekly: boolean; threshold: number; email: string; brand: string };
}
const defaults: Saved = { excluded: [], work: {}, read: [], connections: ['wb', 'ozon', 'ym'], settings: { newTopic: true, growth: true, weekly: true, threshold: 5, email: '', brand: 'Хюгге Хоум' } };
function restore(): Saved {
  try {
    const data = JSON.parse(localStorage.getItem('signal:demo:v1') || 'null');
    if (!data || !Array.isArray(data.excluded) || !Array.isArray(data.read) || !Array.isArray(data.connections)) return structuredClone(defaults);
    return { ...structuredClone(defaults), ...data, settings: { ...defaults.settings, ...data.settings } };
  } catch { return structuredClone(defaults); }
}
export const state = {
  route: location.hash.slice(1) || 'topics',
  filters: { days: 56, marketplace: 'all', productId: 'all' } as Filters,
  cause: 'Все', topicSearch: '', reviewSearch: '', reviewRating: 'all', reviewTopic: 'all', reviewPage: 1,
  topicMarket: 'all', reviewLimit: 4, productSearch: '', alertTab: 'all', sort: 'count',
  modal: null as { type: string; id?: string } | null,
  mobileMenu: false, toast: '', saved: restore(),
};
export function save() { try { localStorage.setItem('signal:demo:v1', JSON.stringify(state.saved)); } catch { /* Session remains usable without storage. */ } }
export function allReviews(): Review[] { return mockReviewRepository.list({ days: 56, marketplace: 'all', productId: 'all' }).map(r => state.saved.excluded.includes(r.id) ? { ...r, topicId: null, confidence: null } : r); }
export function selectedReviews(): Review[] { return filterReviews(allReviews(), state.filters, DEMO_NOW); }
export function getWork(id: string): TopicWork { return state.saved.work[id] ?? { status: id === 'leak' ? 'В работе' : 'Новая', assignee: id === 'leak' ? 'Олег П., контроль качества' : 'Не назначен', deadline: '2026-10-31', notes: id === 'leak' ? [{ text: 'Запросили у фабрики образцы партии 2408, чтобы проверить уплотнитель крышки.', createdAt: '2026-10-25T12:00:00Z' }] : [] }; }
export function updateWork(id: string, update: Partial<TopicWork>) { state.saved.work[id] = { ...getWork(id), ...update }; save(); }
export function unreadCount() { return ['1', '2', '3'].filter(id => !state.saved.read.includes(id)).length; }
export function resetDemo() { state.saved = structuredClone(defaults); save(); }
