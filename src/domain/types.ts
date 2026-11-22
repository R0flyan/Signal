export type Marketplace = 'wb' | 'ozon' | 'ym';
export type Cause = 'Товар' | 'Упаковка' | 'Доставка' | 'Комплектация';
export type Priority = 'Высокий' | 'Средний' | 'Низкий';
export type TopicStatus = 'Новая' | 'В работе' | 'Решена';

export interface Topic {
  id: string;
  title: string;
  phrases: string[];
  cause: Cause;
  priority: Priority;
  isNew?: boolean;
  weekly: number[];
  platforms: Partial<Record<Marketplace, number>>;
  productCount: number;
  description: string;
}

export interface Review {
  id: string;
  marketplace: Marketplace;
  productId: string;
  rating: number;
  text: string;
  publishedAt: string;
  topicId: string | null;
  author: string;
  batch: string | null;
  confidence: number | null;
}

export interface Product {
  id: string;
  name: string;
  variant: string;
  sku: string;
  kind: 'cup' | 'bottle' | 'box';
  color: string;
  marketplaces: Marketplace[];
}

export interface Filters {
  days: number;
  marketplace: Marketplace | 'all';
  productId: string;
}

export interface TopicWork {
  status: TopicStatus;
  assignee: string;
  deadline: string;
  notes: { text: string; createdAt: string }[];
}
