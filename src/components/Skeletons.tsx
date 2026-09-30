import React from 'react';

/**
 * Skeleton placeholder for the CategoryChips horizontal list
 */
export const CategoryChipsSkeleton: React.FC = () => {
  return (
    <section className="px-4 mt-3 shrink-0 select-none" aria-label="Loading categories...">
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 w-20 bg-gray-200 rounded-md animate-pulse" />
      </div>

      <div
        className="flex items-center gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {[80, 95, 75, 110, 85, 90].map((width, idx) => (
          <div
            key={idx}
            style={{ width: `${width}px` }}
            className="h-8 shrink-0 bg-gray-200/80 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </section>
  );
};

/**
 * Skeleton placeholder for the Best Selling 2-column product grid
 */
export const BestSellingSkeleton: React.FC = () => {
  return (
    <section className="px-4 mt-6 pb-6 shrink-0" aria-label="Loading products...">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-3">
        <div className="h-5 w-28 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-4 w-16 bg-gray-200 rounded-md animate-pulse" />
      </div>

      {/* 2-column grid matching ProductCard layout */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white rounded-2xl p-2.5 border border-gray-100/90 shadow-xs flex flex-col justify-between"
          >
            <div>
              {/* Product Image Box Skeleton */}
              <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2 animate-pulse flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gray-200/60" />
              </div>

              {/* Title lines skeleton */}
              <div className="space-y-1.5 px-0.5">
                <div className="h-3.5 w-full bg-gray-200 rounded-sm animate-pulse" />
                <div className="h-3.5 w-3/4 bg-gray-200 rounded-sm animate-pulse" />
              </div>

              {/* Rating & reviews skeleton */}
              <div className="flex items-center gap-1.5 mt-2 px-0.5">
                <div className="h-3 w-8 bg-amber-100 rounded-sm animate-pulse" />
                <div className="h-3 w-12 bg-gray-200 rounded-sm animate-pulse" />
              </div>
            </div>

            {/* Price & Button skeleton */}
            <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between gap-1.5">
              <div className="space-y-1">
                <div className="h-4 w-14 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-2.5 w-10 bg-gray-200/70 rounded-sm animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-orange-100 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/**
 * Skeleton placeholder for CategoriesView
 */
export const CategoriesViewSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <div className="h-5 w-36 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-3.5 w-48 bg-gray-200/70 rounded-md animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70 flex items-center gap-3.5"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200/80 rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
