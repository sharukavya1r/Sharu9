import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Star,
  Pencil,
  CheckCircle2,
  ThumbsUp,
  Filter,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  User,
} from 'lucide-react';
import { ProductReview } from '../types';
import {
  fetchReviewsApi,
  submitReviewApi,
  ReviewApiResponse,
  RatingBreakdown,
} from '../services/reviewApi';
import { formatReviewerName, REVIEWS_UPDATED_EVENT } from '../services/reviewService';

export interface ReviewProps {
  productId: string;
  productName: string;
  onRatingStatsChange?: (stats: { rating: number | null; reviewCount: number }) => void;
}

type SortOrder = 'recent' | 'highest' | 'lowest';

export const Review: React.FC<ReviewProps> = ({
  productId,
  productName,
  onRatingStatsChange,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<ReviewApiResponse['stats']>({
    averageRating: null,
    totalReviews: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recommendationPercent: 100,
  });

  // UI Filter & Sort States
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOrder>('recent');

  // Write Review Form States
  const [isWritingReview, setIsWritingReview] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');

  // Helpful votes state (persisted locally per review ID)
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, { count: number; voted: boolean }>>(() => {
    try {
      const stored = localStorage.getItem(`quke_helpful_${productId}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Read current user profile name for review prefill
  const defaultUserName = useMemo(() => {
    try {
      const stored = localStorage.getItem('quke_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) return parsed.name;
      }
    } catch {}
    return '';
  }, []);

  useEffect(() => {
    if (defaultUserName && !reviewerName) {
      setReviewerName(defaultUserName);
    }
  }, [defaultUserName, reviewerName]);

  // Fetch reviews from the simulated API
  const loadReviewsFromApi = useCallback(async (showLoadingSpinner = true) => {
    if (!productId) return;
    if (showLoadingSpinner) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetchReviewsApi(productId);
      setReviews(response.reviews);
      setStats(response.stats);

      if (onRatingStatsChange) {
        onRatingStatsChange({
          rating: response.stats.averageRating,
          reviewCount: response.stats.totalReviews,
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch reviews from simulated API:', err);
      setError(err?.message || 'Unable to load customer reviews at this time.');
    } finally {
      setLoading(false);
    }
  }, [productId, onRatingStatsChange]);

  // Initial load and whenever productId changes
  useEffect(() => {
    setSelectedStarFilter(null);
    setIsWritingReview(false);
    setFormError('');
    setFormSuccess('');
    loadReviewsFromApi(true);
  }, [productId, loadReviewsFromApi]);

  // Listen to cross-component review update events
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ productId?: string }>;
      if (!customEvent.detail || customEvent.detail.productId === productId) {
        loadReviewsFromApi(false);
      }
    };

    window.addEventListener(REVIEWS_UPDATED_EVENT, handleSync);
    return () => {
      window.removeEventListener(REVIEWS_UPDATED_EVENT, handleSync);
    };
  }, [productId, loadReviewsFromApi]);

  // Save helpful votes to localStorage
  const handleToggleHelpful = (reviewId: string) => {
    setHelpfulVotes((prev) => {
      const current = prev[reviewId] || { count: 2, voted: false };
      const updated = {
        ...prev,
        [reviewId]: {
          count: current.voted ? Math.max(0, current.count - 1) : current.count + 1,
          voted: !current.voted,
        },
      };
      try {
        localStorage.setItem(`quke_helpful_${productId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Submit review handler using the simulated API POST
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setFormError('Please write a few words about your experience with this product.');
      return;
    }
    if (newRating < 1 || newRating > 5) {
      setFormError('Please select a star rating between 1 and 5.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const result = await submitReviewApi(productId, {
        userName: reviewerName.trim() || 'Verified Customer',
        rating: newRating,
        comment: newComment.trim(),
        verifiedPurchase: true,
      });

      // Update state with newly submitted review & refreshed stats
      setReviews((prev) => [result.review, ...prev]);
      setStats(result.stats);
      if (onRatingStatsChange) {
        onRatingStatsChange({
          rating: result.stats.averageRating,
          reviewCount: result.stats.totalReviews,
        });
      }

      setNewComment('');
      setIsWritingReview(false);
      setFormSuccess('Thank you! Your verified review has been published.');

      setTimeout(() => {
        setFormSuccess('');
      }, 5000);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter and sort the reviews
  const filteredAndSortedReviews = useMemo(() => {
    let list = [...reviews];

    // Star filter
    if (selectedStarFilter !== null) {
      list = list.filter((r) => Math.round(r.rating) === selectedStarFilter);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'highest') {
        return b.rating - a.rating;
      }
      if (sortBy === 'lowest') {
        return a.rating - b.rating;
      }
      // 'recent' by default - if dates match, maintain stability
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return dateB - dateA;
    });

    return list;
  }, [reviews, selectedStarFilter, sortBy]);

  return (
    <div
      id="section-ratings-reviews"
      className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs"
    >
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#0B1528]">Customer Ratings &amp; Reviews</h3>
            <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              Verified Feedback
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Real feedback from buyers of {productName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh simulated API */}
          <button
            type="button"
            id="btn-refresh-reviews"
            onClick={() => loadReviewsFromApi(true)}
            disabled={loading}
            title="Refresh reviews from API"
            aria-label="Refresh reviews from API"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FF8C00]' : ''}`} />
          </button>

          {/* Write a review toggle */}
          <button
            type="button"
            id="btn-toggle-write-review"
            onClick={() => {
              setIsWritingReview(!isWritingReview);
              setFormError('');
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isWritingReview
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-[#FF8C00] text-white hover:bg-orange-600'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{isWritingReview ? 'Close Form' : 'Write a Review'}</span>
          </button>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {formSuccess && (
        <div
          id="review-success-banner"
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2.5 animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* WRITE REVIEW FORM */}
      {isWritingReview && (
        <form
          id="form-write-review"
          onSubmit={handleSubmitReview}
          className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 sm:p-4 space-y-3.5 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#0B1528] flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-[#FF8C00] text-[#FF8C00]" />
              Share Your Honest Review
            </h4>
            <span className="text-[10px] text-gray-400 font-medium">100% Genuine Buyer Verified</span>
          </div>

          {/* Star Rating Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-700 block">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = star <= (hoverRating || newRating);
                return (
                  <button
                    key={star}
                    type="button"
                    id={`btn-rate-star-${star}`}
                    onClick={() => setNewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none cursor-pointer active:scale-90 transition-transform"
                    aria-label={`Rate ${star} out of 5 stars`}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        isLit ? 'fill-amber-400 text-amber-500' : 'text-gray-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-bold text-[#0B1528] ml-2 bg-white px-2 py-0.5 rounded border border-gray-200">
                {newRating} / 5 Stars ({newRating === 5 ? 'Excellent' : newRating === 4 ? 'Good' : newRating === 3 ? 'Average' : 'Below Average'})
              </span>
            </div>
          </div>

          {/* Reviewer Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700 block">
              Your Name (Optional)
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                id="input-reviewer-name"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-8.5 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF8C00] transition-colors"
              />
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700 block">
              Your Feedback &amp; Experience <span className="text-red-500">*</span>
            </label>
            <textarea
              id="textarea-review-comment"
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="Tell others what you loved about this accessory: build quality, charging speed, sound profile, durability..."
              rows={3}
              className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF8C00] resize-none transition-colors"
            />
            {formError && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {formError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              id="btn-cancel-review"
              onClick={() => {
                setIsWritingReview(false);
                setFormError('');
              }}
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-review"
              disabled={submitting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#0B1528] hover:bg-[#FF8C00] rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting to API...</span>
                </>
              ) : (
                <span>Submit Review</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* RATINGS SUMMARY SCORE CARD */}
      <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3.5 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Left: Overall Big Score */}
          <div className="sm:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left justify-center sm:border-r sm:border-gray-200 sm:pr-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#0B1528] tracking-tight">
                {stats.averageRating !== null && stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : '—'}
              </span>
              <span className="text-sm font-semibold text-gray-400">/ 5</span>
            </div>

            <div className="flex items-center gap-1 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    stats.averageRating && s <= Math.round(stats.averageRating)
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>

            <p className="text-[11px] text-gray-500 font-medium">
              {stats.totalReviews > 0
                ? `Based on ${stats.totalReviews} customer ${stats.totalReviews === 1 ? 'rating' : 'ratings'}`
                : 'No reviews yet'}
            </p>

            {stats.totalReviews > 0 && (
              <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" />
                <span>{stats.recommendationPercent}% recommend this product</span>
              </div>
            )}
          </div>

          {/* Right: Star Distribution Bars */}
          <div className="sm:col-span-7 space-y-1.5">
            {([5, 4, 3, 2, 1] as const).map((starNumber) => {
              const count = stats.breakdown[starNumber] || 0;
              const percent = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
              const isSelected = selectedStarFilter === starNumber;

              return (
                <button
                  key={starNumber}
                  type="button"
                  id={`btn-filter-star-${starNumber}`}
                  onClick={() =>
                    setSelectedStarFilter(isSelected ? null : starNumber)
                  }
                  className={`w-full flex items-center gap-2 group text-left cursor-pointer p-0.5 rounded hover:bg-white/80 transition-colors ${
                    isSelected ? 'bg-amber-50/80 font-bold' : ''
                  }`}
                  title={`Filter by ${starNumber} stars`}
                >
                  <span className="text-[11px] font-semibold text-gray-600 w-6 flex items-center gap-0.5">
                    {starNumber} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                  </span>

                  {/* Progress bar container */}
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected
                          ? 'bg-[#FF8C00]'
                          : starNumber >= 4
                          ? 'bg-amber-400 group-hover:bg-amber-500'
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-gray-500 font-medium w-8 text-right">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER & SORT CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b border-gray-100 pb-2.5">
        {/* Star Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            type="button"
            id="btn-filter-all"
            onClick={() => setSelectedStarFilter(null)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              selectedStarFilter === null
                ? 'bg-[#0B1528] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = stats.breakdown[s as keyof RatingBreakdown] || 0;
            if (count === 0 && selectedStarFilter !== s) return null;
            return (
              <button
                key={s}
                type="button"
                id={`pill-filter-${s}`}
                onClick={() => setSelectedStarFilter(selectedStarFilter === s ? null : s)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                  selectedStarFilter === s
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{s}</span>
                <Star className="w-2.5 h-2.5 fill-current" />
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> Sort:
          </span>
          <select
            id="select-review-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOrder)}
            className="text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF8C00] cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* ACTIVE FILTER NOTICE */}
      {selectedStarFilter !== null && (
        <div className="flex items-center justify-between text-xs bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg">
          <span>
            Showing <strong>{selectedStarFilter} Star</strong> reviews ({filteredAndSortedReviews.length})
          </span>
          <button
            type="button"
            id="btn-clear-star-filter"
            onClick={() => setSelectedStarFilter(null)}
            className="text-[11px] font-bold text-[#FF8C00] hover:underline cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* REVIEWS LIST / SKELETON / EMPTY STATE */}
      {loading ? (
        /* SKELETON LOADING STATE */
        <div className="space-y-3 py-2" id="reviews-skeleton-loading">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF8C00]" />
            <span>Fetching verified reviews from simulated API...</span>
          </div>
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200" />
                  <div className="w-24 h-3.5 bg-gray-200 rounded" />
                  <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>
                <div className="w-16 h-3 bg-gray-200 rounded" />
              </div>
              <div className="w-20 h-3 bg-gray-200 rounded" />
              <div className="w-full h-3.5 bg-gray-200 rounded" />
              <div className="w-3/4 h-3.5 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* ERROR STATE */
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-2">
          <AlertCircle className="w-5 h-5 text-red-500 mx-auto" />
          <p className="text-xs font-bold text-red-800">{error}</p>
          <button
            type="button"
            onClick={() => loadReviewsFromApi(true)}
            className="text-xs font-bold px-3 py-1.5 bg-white border border-red-200 rounded-lg text-red-700 hover:bg-red-50 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : filteredAndSortedReviews.length > 0 ? (
        /* REVIEWS LIST */
        <div className="divide-y divide-gray-100" id="customer-feedback-list">
          {filteredAndSortedReviews.map((rev) => {
            const helpfulState = helpfulVotes[rev.id] || { count: 2, voted: false };
            return (
              <div
                key={rev.id}
                id={`review-item-${rev.id}`}
                className="py-3.5 first:pt-1 last:pb-1 space-y-2"
              >
                {/* Reviewer Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0B1528]/10 text-[#0B1528] font-bold text-xs flex items-center justify-center border border-[#0B1528]/10">
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0B1528] block">
                        {formatReviewerName(rev.userName)}
                      </span>
                      {rev.verifiedPurchase !== false && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>

                  {rev.date && (
                    <span className="text-[11px] text-gray-400 font-medium">
                      {rev.date}
                    </span>
                  )}
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-bold text-gray-700 ml-1.5">
                    {rev.rating} / 5
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs text-gray-700 leading-relaxed pt-0.5">
                  {rev.comment}
                </p>

                {/* Helpful action */}
                <div className="pt-1 flex items-center gap-2 text-[11px] text-gray-500">
                  <button
                    type="button"
                    id={`btn-helpful-${rev.id}`}
                    onClick={() => handleToggleHelpful(rev.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer text-[10px] font-semibold ${
                      helpfulState.voted
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${helpfulState.voted ? 'fill-amber-500 text-amber-600' : ''}`} />
                    <span>Helpful ({helpfulState.count})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* EMPTY STATE */
        <div
          id="reviews-empty-state"
          className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center space-y-2.5"
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#0B1528]">
              {selectedStarFilter !== null
                ? `No ${selectedStarFilter}-star reviews found`
                : 'No customer reviews yet'}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {selectedStarFilter !== null
                ? 'Try clearing the star filter to view other feedback.'
                : 'Be the first buyer to review this accessory!'}
            </p>
          </div>
          {selectedStarFilter !== null ? (
            <button
              type="button"
              onClick={() => setSelectedStarFilter(null)}
              className="text-xs font-bold px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[#0B1528] hover:bg-gray-100 cursor-pointer"
            >
              Show All Reviews
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsWritingReview(true)}
              className="text-xs font-bold px-4 py-1.5 bg-[#0B1528] hover:bg-[#FF8C00] text-white rounded-lg transition-colors cursor-pointer"
            >
              Write First Review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Review;
