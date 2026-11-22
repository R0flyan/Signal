import { reviews, topics, products, DEMO_NOW } from '../mocks/data.ts';
import { filterReviews } from '../domain/analytics.ts';
import type { Filters, Review } from '../domain/types.ts';

// Replace this adapter with HTTP calls when the server is ready.
export interface ReviewRepository {
  list(filters: Filters): Review[];
}

export const mockReviewRepository: ReviewRepository = {
  list: filters => filterReviews(reviews, filters, DEMO_NOW),
};

export const mockCatalog = { topics, products };
