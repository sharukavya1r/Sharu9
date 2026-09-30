import React, { useState } from 'react';
import {
  Cable,
  Zap,
  Headphones,
  ArrowLeft,
} from 'lucide-react';
import { ProductItem } from '../types';
import { BEST_SELLING_PRODUCTS } from '../data';
import { ProductCard } from './ProductCard';
import { CategoriesViewSkeleton } from './Skeletons';

interface CategoriesViewProps {
  onBackToHome: () => void;
  onAddToCart: (product: ProductItem) => void;
  onSelectProduct?: (product: ProductItem) => void;
  recentlyAddedId: string | null;
  showToast: (msg: string) => void;
  isLoading?: boolean;
}

interface CategoryCard {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
  description: string;
  gradient: string;
}

export const CATEGORY_LIST: CategoryCard[] = [
  {
    id: 'cables',
    name: 'Cables',
    count: 2,
    icon: <Cable className="w-5 h-5 text-orange-500" />,
    description: 'Braided Type-C, Lightning & 100W PD cables',
    gradient: 'from-orange-50 to-amber-50',
  },
  {
    id: 'chargers',
    name: 'Chargers',
    count: 2,
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
    description: '20W to 65W GaN dual-port super chargers',
    gradient: 'from-amber-50 to-yellow-50',
  },
  {
    id: 'earphones',
    name: 'Headphones',
    count: 2,
    icon: <Headphones className="w-5 h-5 text-blue-500" />,
    description: 'Noise cancelling earphones & premium audio',
    gradient: 'from-blue-50 to-indigo-50',
  },
];

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  onBackToHome,
  onAddToCart,
  onSelectProduct,
  recentlyAddedId,
  showToast,
  isLoading = false,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const selectedCategory = CATEGORY_LIST.find((c) => c.id === selectedCategoryId);

  // Filter products for the chosen category
  const filteredProducts = selectedCategoryId
    ? BEST_SELLING_PRODUCTS.filter(
        (p) =>
          p.category === selectedCategoryId ||
          (selectedCategoryId === 'earphones' && p.category === 'headphones') ||
          (selectedCategoryId === 'headphones' && p.category === 'earphones')
      )
    : [];

  if (isLoading) {
    return <CategoriesViewSkeleton />;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Section Heading / Active Category Bar */}
      {!selectedCategory ? (
        <div className="pt-0.5">
          <h2 className="text-base font-bold text-[#001f3f]">All Categories</h2>
          <p className="text-[11px] text-gray-400">
            3 curated mobile accessories categories
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className="p-1 -ml-1 text-gray-600 hover:text-gray-900 rounded-full cursor-pointer flex items-center gap-1"
              aria-label="Back to all categories"
            >
              <ArrowLeft className="w-4 h-4 text-[#001f3f]" />
              <span className="text-xs font-bold text-[#001f3f]">
                {selectedCategory.name}
              </span>
            </button>
            <span className="text-[11px] text-gray-400">
              • {filteredProducts.length} accessories
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className="text-xs font-bold text-[#FF8C00] hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>
      )}

      {/* If category selected: Show Category Products */}
      {selectedCategoryId && selectedCategory ? (
        <div className="space-y-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 w-full">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onSelectProduct={onSelectProduct}
                  isAdded={recentlyAddedId === product.id}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-500 font-medium">
                No items currently in this category.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="mt-3 px-3 py-1.5 bg-[#001f3f] text-white text-xs font-bold rounded-lg"
              >
                Back to All Categories
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Full 3 Category Cards */
        <div className="grid grid-cols-1 gap-2.5">
          {CATEGORY_LIST.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategoryId(cat.id);
                showToast(`Viewing ${cat.name}`);
              }}
              className="bg-white rounded-xl p-3 border border-gray-100 hover:border-orange-200 shadow-sm flex items-center justify-between cursor-pointer transition-all hover:translate-x-0.5 group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} border border-gray-100 flex items-center justify-center shrink-0 shadow-inner`}
                >
                  {cat.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#001f3f] group-hover:text-[#FF8C00] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-[9px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                      {cat.count} items
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#FF8C00] group-hover:bg-orange-50 transition-colors shrink-0 ml-2">
                →
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
