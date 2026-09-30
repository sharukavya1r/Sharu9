import React, { useState, useEffect } from 'react';
import { Plus, Check, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { ProductItem } from '../types';
import { getProductRatingStats, REVIEWS_UPDATED_EVENT } from '../services/reviewService';

interface ProductCardProps {
  product: ProductItem;
  onAddToCart: (product: ProductItem) => void;
  onSelectProduct?: (product: ProductItem) => void;
  isAdded?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct,
  isAdded = false,
}) => {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : (product.discountPercent && product.discountPercent > 0 ? product.discountPercent : null);

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  // Real review stats from review service
  const [ratingStats, setRatingStats] = useState(() => getProductRatingStats(product.id));

  useEffect(() => {
    setRatingStats(getProductRatingStats(product.id));

    const handleReviewsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ productId?: string }>;
      if (!customEvent.detail || customEvent.detail.productId === product.id) {
        setRatingStats(getProductRatingStats(product.id));
      }
    };

    window.addEventListener(REVIEWS_UPDATED_EVENT, handleReviewsChanged);
    return () => {
      window.removeEventListener(REVIEWS_UPDATED_EVENT, handleReviewsChanged);
    };
  }, [product.id]);

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className={`bg-white rounded-xl border border-gray-100 p-2.5 sm:p-3 shadow-sm flex flex-col justify-between group transition-all w-full ${
        onSelectProduct ? 'cursor-pointer hover:border-gray-300 hover:shadow-md' : ''
      }`}
    >
      {/* Top Product Image Container - Exactly One Image */}
      <div className="relative h-40 sm:h-44 w-full bg-gray-50 rounded-lg flex items-center justify-center p-2 mb-2 overflow-hidden">
        {/* Discount Badge - only if genuine discount exists */}
        {discount && discount > 0 && (
          <span className="absolute top-2 left-2 bg-[#FF8C00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs z-10">
            {discount}% OFF
          </span>
        )}

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain rounded-md"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>

      {/* Rating Row - REAL REVIEWS ONLY */}
      <div className="flex items-center gap-1 mb-1 min-h-[16px]">
        {ratingStats.reviewCount > 0 && ratingStats.rating !== null ? (
          <>
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-700">
              {ratingStats.rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-gray-400">
              ({ratingStats.reviewCount})
            </span>
          </>
        ) : (
          <span className="text-[10px] text-gray-400 font-medium">
            No reviews yet
          </span>
        )}
      </div>

      {/* Product Name */}
      <div className="flex-1 mb-1">
        <h4
          title={product.name}
          className="text-xs font-bold text-[#001f3f] line-clamp-2 leading-tight"
        >
          {product.name}
        </h4>
      </div>

      {/* Bottom: Price and Add Button */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[#FF8C00] font-extrabold text-sm">
            ₹{product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-gray-400 text-[11px] line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Geometric Add to Cart Button */}
        <motion.button
          id={`btn-add-to-cart-${product.id}`}
          whileTap={{ scale: 0.88 }}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          aria-label={`Add ${product.name} to cart`}
          className={`h-7 px-2.5 sm:px-3 rounded-lg border flex items-center gap-1 text-xs font-bold transition-all cursor-pointer shadow-xs ${
            isAdded
              ? 'bg-[#001f3f] border-[#001f3f] text-white'
              : 'bg-[#FF8C00] border-[#FF8C00] text-white hover:bg-orange-600'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
