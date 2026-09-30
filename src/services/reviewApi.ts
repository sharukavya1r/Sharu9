import { ProductReview } from '../types';
import {
  getProductReviews,
  addProductReview,
} from './reviewService';

export interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface ReviewApiResponse {
  productId: string;
  reviews: ProductReview[];
  stats: {
    averageRating: number | null;
    totalReviews: number;
    breakdown: RatingBreakdown;
    recommendationPercent: number;
  };
}

/**
 * Helper to compute review stats from real reviews
 */
function calculateStats(reviews: ProductReview[]): ReviewApiResponse['stats'] {
  const breakdown: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (reviews.length === 0) {
    return {
      averageRating: null,
      totalReviews: 0,
      breakdown,
      recommendationPercent: 0,
    };
  }

  let totalScore = 0;
  let positiveReviews = 0;

  for (const r of reviews) {
    const star = Math.max(1, Math.min(5, Math.round(r.rating))) as keyof RatingBreakdown;
    breakdown[star] = (breakdown[star] || 0) + 1;
    totalScore += star;
    if (star >= 4) {
      positiveReviews += 1;
    }
  }

  const averageRating = Number((totalScore / reviews.length).toFixed(1));
  const recommendationPercent = Math.round((positiveReviews / reviews.length) * 100);

  return {
    averageRating,
    totalReviews: reviews.length,
    breakdown,
    recommendationPercent,
  };
}

/**
 * Fetch real customer ratings and reviews for a product.
 * Returns only real user-submitted reviews.
 */
export async function fetchReviewsApi(productId: string): Promise<ReviewApiResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 250));

  if (!productId) {
    throw new Error('Product ID is required to fetch reviews');
  }

  const storedReviews = getProductReviews(productId);
  const stats = calculateStats(storedReviews);

  return {
    productId,
    reviews: storedReviews,
    stats,
  };
}

/**
 * Post a new customer review to storage.
 */
export async function submitReviewApi(
  productId: string,
  input: {
    userName?: string;
    rating: number;
    comment: string;
    verifiedPurchase?: boolean;
  }
): Promise<{ review: ProductReview; stats: ReviewApiResponse['stats'] }> {
  // Simulate network POST latency
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (!productId) {
    throw new Error('Product ID is required');
  }
  if (!input.comment || !input.comment.trim()) {
    throw new Error('Review comment cannot be empty');
  }
  if (!input.rating || input.rating < 1 || input.rating > 5) {
    throw new Error('Rating must be between 1 and 5 stars');
  }

  // Persist review into real storage
  const newReview = addProductReview(productId, {
    userName: input.userName || 'Verified Customer',
    rating: input.rating,
    comment: input.comment,
    verifiedPurchase: input.verifiedPurchase ?? true,
  });

  // Re-fetch and re-calculate full stats
  const allStored = getProductReviews(productId);
  const stats = calculateStats(allStored);

  return {
    review: newReview,
    stats,
  };
}
