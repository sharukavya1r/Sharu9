import { ProductReview } from '../types';

/**
 * Seeded fake reviews have been deprecated and deactivated.
 * Real reviews must originate exclusively from actual customer submissions.
 */
export const DEFAULT_SEEDED_FEEDBACK: Record<string, Omit<ProductReview, 'id'>[]> = {};

export function getSeededReviews(_productId: string): ProductReview[] {
  return [];
}
