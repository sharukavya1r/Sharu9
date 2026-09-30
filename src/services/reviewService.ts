import { ProductReview } from '../types';

const REVIEWS_STORAGE_PREFIX = 'quke_reviews_';
export const REVIEWS_UPDATED_EVENT = 'quke_reviews_updated';

/**
 * Format reviewer name safely to prevent leaking emails, phone numbers, or private details
 */
export function formatReviewerName(name?: string): string {
  if (!name || !name.trim()) return 'Verified Customer';

  const clean = name.trim();

  // If email address, strip domain and format username
  if (clean.includes('@')) {
    const userPart = clean.split('@')[0];
    const words = userPart.replace(/[._-]+/g, ' ').trim().split(/\s+/);
    if (words.length >= 2) {
      return `${words[0].charAt(0).toUpperCase() + words[0].slice(1)} ${words[1].charAt(0).toUpperCase()}.`;
    }
    return words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'Customer';
  }

  // If phone number, mask digits
  if (/^\+?[0-9\s-]{8,}$/.test(clean)) {
    const digits = clean.replace(/\D/g, '');
    const last4 = digits.slice(-4);
    return `Customer (${last4 ? `••••${last4}` : 'Verified'})`;
  }

  // Standard name: "First Last" -> "First L."
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0];
  }
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

/**
 * Get all real customer reviews for a given product
 */
export function getProductReviews(productId: string): ProductReview[] {
  if (typeof window === 'undefined' || !productId) {
    return [];
  }

  try {
    const raw = localStorage.getItem(`${REVIEWS_STORAGE_PREFIX}${productId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out any corrupted or fake mock reviews
    return parsed.filter((r) => {
      if (!r || typeof r !== 'object') return false;
      if (typeof r.rating !== 'number' || r.rating < 1 || r.rating > 5) return false;
      if (typeof r.comment !== 'string' || !r.comment.trim()) return false;
      // Filter out any legacy seeded / demo reviews
      if (typeof r.id === 'string' && r.id.startsWith('seed_')) return false;
      if (r.userName === 'Google U.' || r.comment === 'Nice') return false;
      return true;
    });
  } catch (err) {
    console.error(`Error loading reviews for ${productId}:`, err);
    return [];
  }
}

/**
 * Calculate the product's real average rating and review count from submitted customer reviews only.
 * Returns rating: null and reviewCount: 0 when no reviews exist.
 */
export function getProductRatingStats(productId: string): {
  rating: number | null;
  reviewCount: number;
} {
  const reviews = getProductReviews(productId);
  if (reviews.length === 0) {
    return { rating: null, reviewCount: 0 };
  }

  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = Number((total / reviews.length).toFixed(1));
  return {
    rating: avg,
    reviewCount: reviews.length,
  };
}

/**
 * Save a new real customer review for a product
 */
export function addProductReview(
  productId: string,
  reviewInput: {
    userName?: string;
    rating: number;
    comment: string;
    verifiedPurchase?: boolean;
  }
): ProductReview {
  if (!productId) {
    throw new Error('Product ID is required to submit a review');
  }

  const existingReviews = getProductReviews(productId);
  const ratingValue = Math.max(1, Math.min(5, Math.round(reviewInput.rating)));

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const newReview: ProductReview = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userName: reviewInput.userName?.trim() || 'Verified Customer',
    rating: ratingValue,
    date: formattedDate,
    comment: reviewInput.comment.trim(),
    verifiedPurchase: reviewInput.verifiedPurchase ?? true,
  };

  const updated = [newReview, ...existingReviews];

  try {
    localStorage.setItem(
      `${REVIEWS_STORAGE_PREFIX}${productId}`,
      JSON.stringify(updated)
    );
  } catch (err) {
    console.error(`Error saving review for ${productId}:`, err);
  }

  // Dispatch real-time event so all cards & details re-sync immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(REVIEWS_UPDATED_EVENT, {
        detail: { productId, review: newReview },
      })
    );
  }

  return newReview;
}

/**
 * Clean legacy demo / seeded reviews from localStorage
 */
export function cleanLegacyDemoReviews(): void {
  if (typeof window === 'undefined') return;

  try {
    const keysToProcess: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(REVIEWS_STORAGE_PREFIX)) {
        keysToProcess.push(key);
      }
    }

    for (const key of keysToProcess) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((r) => {
              if (!r || typeof r !== 'object') return false;
              if (typeof r.rating !== 'number' || r.rating < 1 || r.rating > 5) return false;
              if (!r.comment || typeof r.comment !== 'string' || !r.comment.trim()) return false;
              if (typeof r.id === 'string' && r.id.startsWith('seed_')) return false;
              if (r.userName === 'Google U.' || r.comment === 'Nice') return false;
              return true;
            });
            if (cleaned.length === 0) {
              localStorage.removeItem(key);
            } else if (cleaned.length !== parsed.length) {
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (err) {
    console.error('Error cleaning legacy demo reviews:', err);
  }
}

// Automatically clean legacy demo reviews on module initialization
if (typeof window !== 'undefined') {
  cleanLegacyDemoReviews();
}
