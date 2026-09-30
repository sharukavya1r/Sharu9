import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Package,
  Star,
  Zap,
  Truck,
  MapPin,
  RotateCcw,
  RefreshCw,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Check,
  Pencil,
  Share2,
  Download,
  ShoppingBag,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductItem, SavedAddress } from '../types';
import { getStandardDeliveryFee, calculateDeliveryFee } from '../utils/delivery';
import {
  getProductRatingStats,
  REVIEWS_UPDATED_EVENT,
} from '../services/reviewService';
import { Review } from './Review';

interface ProductDetailsModalProps {
  isOpen: boolean;
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart?: (product: ProductItem) => void;
  savedAddresses?: SavedAddress[];
  selectedAddress?: SavedAddress | null;
  onSelectAddress?: (address: SavedAddress) => void;
}

type PolicyKey = 'cancellation' | 'return' | 'cod' | 'warranty';
type DetailTab = 'Specifications' | 'Description' | 'Warranty' | 'Manufacturer Info';

const PEACE_OF_MIND_POLICIES: Record<
  PolicyKey,
  {
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ReactNode;
    highlights: string[];
  }
> = {
  cancellation: {
    title: 'Order Cancellation Policy',
    subtitle: 'Zero fee cancellation before dispatch',
    badge: 'Hassle-Free',
    icon: <RotateCcw className="w-5 h-5" />,
    highlights: [
      'Cancel anytime before the order is dispatched directly from the Orders tab with zero penalty.',
      'Instant 100% full refund credited back immediately to your original payment method for prepaid orders.',
      'No cancellation fees or penalties apply for Cash on Delivery orders.',
      'Real-time transit tracking indicates if your item is being packed or already on courier truck.',
    ],
  },
  return: {
    title: '7-Day Return & Replacement',
    subtitle: 'Doorstep replacement guarantee',
    badge: '7-Day Window',
    icon: <RefreshCw className="w-5 h-5" />,
    highlights: [
      '7-Day hassle-free return or replacement on all accessories from delivery date.',
      'Covers defective connectors, damaged or broken items, and wrong product delivery.',
      'Upload photo or video proof directly in the Orders tab to initiate a rapid replacement claim.',
      'Local orders qualify for free doorstep pickup and immediate replacement dispatch.',
    ],
  },
  cod: {
    title: 'Cash on Delivery (COD)',
    subtitle: 'Pay cash or UPI at your doorstep',
    badge: '19,000+ PIN Codes',
    icon: <Banknote className="w-5 h-5" />,
    highlights: [
      'No advance digital payment or card details required to place your order.',
      'Pay with physical cash directly to the delivery partner upon receiving your package.',
      'Delivery executives carry dynamic UPI QR codes so you can scan & pay via GPay, PhonePe, or Paytm at your doorstep.',
      'Free delivery on all orders ₹299 and above across India.',
    ],
  },
  warranty: {
    title: 'Brand Replacement Warranty',
    subtitle: '6-Month manufacturer protection',
    badge: '6 Months',
    icon: <ShieldCheck className="w-5 h-5" />,
    highlights: [
      'Includes 6-Month QukeBasket Brand Replacement Warranty covering manufacturing defects and internal wiring failures.',
      'Hassle-free replacement claims via Toll-Free Helpline 1800-QUKE-BASKET or WhatsApp support desk.',
      'Does not cover intentional physical damage, liquid ingress, or external abuse.',
      'Your digital order receipt serves as your official valid warranty document.',
    ],
  },
};

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen = true,
  product: initialProduct,
  onClose,
  onAddToCart,
  savedAddresses = [],
  selectedAddress = null,
  onSelectAddress,
}) => {
  const [product, setProduct] = useState<ProductItem | null>(initialProduct);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const [ratingStats, setRatingStats] = useState<{
    rating: number | null;
    reviewCount: number;
  }>(() => {
    if (!initialProduct) return { rating: null, reviewCount: 0 };
    return getProductRatingStats(initialProduct.id);
  });

  useEffect(() => {
    setProduct(initialProduct);
    if (initialProduct) {
      setRatingStats(getProductRatingStats(initialProduct.id));
    }
  }, [initialProduct]);

  useEffect(() => {
    if (!product?.id) return;
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ productId?: string }>;
      if (!customEvent.detail || customEvent.detail.productId === product.id) {
        setRatingStats(getProductRatingStats(product.id));
      }
    };
    window.addEventListener(REVIEWS_UPDATED_EVENT, handleSync);
    return () => {
      window.removeEventListener(REVIEWS_UPDATED_EVENT, handleSync);
    };
  }, [product?.id]);

  // Active address management with fallback to savedAddresses or localStorage
  const [activeAddress, setActiveAddress] = useState<SavedAddress | null>(() => {
    if (selectedAddress) return selectedAddress;
    if (savedAddresses.length > 0) {
      return savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
    }
    try {
      const stored = localStorage.getItem('quke_saved_addresses');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.find((a: SavedAddress) => a.isDefault) || parsed[0];
        }
      }
    } catch {
      // Fallback
    }
    return null;
  });

  useEffect(() => {
    if (selectedAddress) {
      setActiveAddress(selectedAddress);
    } else if (savedAddresses.length > 0) {
      setActiveAddress((prev) => prev || savedAddresses.find((a) => a.isDefault) || savedAddresses[0]);
    }
  }, [selectedAddress, savedAddresses]);

  // Interactive Section States
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyKey | null>(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState<DetailTab>('Specifications');

  const contentScrollRef = useRef<HTMLDivElement>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPriceDropOpen, setIsPriceDropOpen] = useState(false);
  const [priceDropEmail, setPriceDropEmail] = useState('');
  const [priceDropSubscribed, setPriceDropSubscribed] = useState(false);

  const showModalToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareProduct = async () => {
    if (!product) return;

    // Real product URL with query parameter ?product={product.id}
    const productUrl = `${window.location.origin}${window.location.pathname}?product=${encodeURIComponent(product.id)}`;
    const shareData = {
      title: product.name,
      text: `${product.name} - ₹${product.price}`,
      url: productUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(productUrl);
      showModalToast('Product link copied to clipboard!');
    } catch {
      showModalToast('Unable to share product link.');
    }
  };

  const handleDownloadProductImage = async () => {
    if (!product) return;
    const imageUrl = images[activeImgIndex] || product.image;
    const safeName = product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeName}_${activeImgIndex + 1}.jpg`;

    try {
      showModalToast('Downloading product image...');
      const response = await fetch(imageUrl, { mode: 'cors', referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showModalToast('Image downloaded successfully!');
    } catch (err) {
      try {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.target = '_blank';
        link.download = fileName;
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showModalToast('Image download opened in new tab.');
      } catch {
        showModalToast('Failed to download image. Please try again.');
      }
    }
  };

  // Images for current product
  const images = product?.images && product.images.length > 0
    ? product.images
    : (product ? [product.image] : []);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentXRef = useRef(0);
  const isSwipingHorizontalRef = useRef(false);
  const activeIndexRef = useRef(activeImgIndex);
  activeIndexRef.current = activeImgIndex;

  // Reset to first image whenever product changes
  useEffect(() => {
    if (product) {
      setActiveImgIndex(0);
      setDragOffset(0);
      setActiveDetailsTab('Specifications');
    }
  }, [product?.id]);

  // Preload all slider images
  useEffect(() => {
    if (images.length > 0) {
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [images]);

  // Touch gesture listeners with passive: false to prevent vertical scroll during horizontal swipe
  useEffect(() => {
    const el = sliderRef.current;
    if (!el || images.length <= 1) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      startXRef.current = touch.clientX;
      startYRef.current = touch.clientY;
      currentXRef.current = touch.clientX;
      isDraggingRef.current = true;
      isSwipingHorizontalRef.current = false;
      setIsDragging(true);
      setDragOffset(0);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - startXRef.current;
      const deltaY = touch.clientY - startYRef.current;

      if (!isSwipingHorizontalRef.current) {
        if (Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY)) {
          isSwipingHorizontalRef.current = true;
        } else if (Math.abs(deltaY) > 6 && Math.abs(deltaY) >= Math.abs(deltaX)) {
          isDraggingRef.current = false;
          setIsDragging(false);
          setDragOffset(0);
          return;
        }
      }

      if (isSwipingHorizontalRef.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
        currentXRef.current = touch.clientX;
        let offset = deltaX;
        const currIdx = activeIndexRef.current;
        const maxIdx = images.length - 1;
        if ((currIdx === 0 && offset > 0) || (currIdx === maxIdx && offset < 0)) {
          offset = offset * 0.25;
        }
        setDragOffset(offset);
      }
    };

    const onTouchEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);

      if (isSwipingHorizontalRef.current) {
        const deltaX = currentXRef.current - startXRef.current;
        const currIdx = activeIndexRef.current;
        const maxIdx = images.length - 1;

        if (deltaX < -40 && currIdx < maxIdx) {
          setActiveImgIndex(currIdx + 1);
        } else if (deltaX > 40 && currIdx > 0) {
          setActiveImgIndex(currIdx - 1);
        }
      }
      setDragOffset(0);
      isSwipingHorizontalRef.current = false;
    };

    const onTouchCancel = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      setDragOffset(0);
      isSwipingHorizontalRef.current = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [images.length]);

  // Desktop mouse drag support
  const handleMouseDown = (e: React.MouseEvent) => {
    if (images.length <= 1) return;
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    isDraggingRef.current = true;
    isSwipingHorizontalRef.current = true;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    currentXRef.current = e.clientX;
    let offset = deltaX;
    const currIdx = activeIndexRef.current;
    const maxIdx = images.length - 1;
    if ((currIdx === 0 && offset > 0) || (currIdx === maxIdx && offset < 0)) {
      offset = offset * 0.25;
    }
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    const deltaX = currentXRef.current - startXRef.current;
    const currIdx = activeIndexRef.current;
    const maxIdx = images.length - 1;

    if (deltaX < -40 && currIdx < maxIdx) {
      setActiveImgIndex(currIdx + 1);
    } else if (deltaX > 40 && currIdx > 0) {
      setActiveImgIndex(currIdx - 1);
    }
    setDragOffset(0);
    isSwipingHorizontalRef.current = false;
  };

  // Pricing calculations
  const originalPrice =
    product?.originalPrice && product.originalPrice > (product?.price || 0)
      ? product.originalPrice
      : undefined;

  const discountPercent =
    originalPrice && product?.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : (product?.discountPercent && product.discountPercent > 0 ? product.discountPercent : undefined);

  // Delivery Calculations based on the active delivery address
  const deliveryCalc = useMemo(() => {
    return calculateDeliveryFee(activeAddress, product?.price || 0);
  }, [activeAddress, product?.price]);

  const estimatedDeliveryDate = useMemo(() => {
    if (!activeAddress || !activeAddress.pincode) {
      return 'Tomorrow by 2:00 PM – 5:00 PM';
    }
    const standard = getStandardDeliveryFee(activeAddress);
    if (standard.zone === 'Same city / very nearby') {
      return 'Tomorrow by 2:00 PM – 5:00 PM (15-Min Express available)';
    }
    if (standard.zone === 'Nearby PIN codes') {
      return 'Tomorrow by 8:00 PM';
    }
    if (standard.zone === 'Same state medium distance') {
      return 'Within 2 business days (by 5:00 PM)';
    }
    if (standard.zone === 'Nearby states') {
      return 'Delivery in 2–3 business days';
    }
    return 'Delivery in 4–6 business days';
  }, [activeAddress]);

  const handleSelectAddress = (addr: SavedAddress) => {
    setActiveAddress(addr);
    setIsAddressPickerOpen(false);
    if (onSelectAddress) {
      onSelectAddress(addr);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div
      id="product-details-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        id="product-details-modal"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col z-10 overflow-hidden shadow-2xl"
      >
        {/* 1. PRODUCT DETAILS HEADER */}
        <div
          id="product-details-header"
          className="px-4 py-3.5 bg-[#0B1528] text-white flex items-center justify-between shrink-0 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-[#FF8C00] flex items-center justify-center">
              <Package className="w-4 h-4 text-[#FF8C00]" />
            </div>
            <h3 className="font-bold text-base tracking-tight text-white">
              Product Details
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="product-details-share-btn"
              onClick={handleShareProduct}
              aria-label="Share product"
              title="Share product"
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-200 hover:text-white bg-white/10 hover:bg-white/20 active:scale-95 cursor-pointer transition-all"
            >
              <Share2 className="w-4 h-4 text-[#FF8C00]" />
            </button>
            <button
              type="button"
              id="product-details-download-btn"
              onClick={handleDownloadProductImage}
              aria-label="Download product image"
              title="Download image"
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-200 hover:text-white bg-white/10 hover:bg-white/20 active:scale-95 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 text-[#FF8C00]" />
            </button>
            <button
              type="button"
              id="product-details-close-btn"
              onClick={onClose}
              aria-label="Close product details"
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-200 hover:text-white bg-white/10 hover:bg-white/20 active:scale-95 cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TOAST NOTIFICATION BANNER */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-4 right-4 z-50 bg-[#0B1528] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between text-xs font-semibold border border-white/10"
            >
              <span>{toastMessage}</span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCROLLABLE CONTENT BODY */}
        <div
          ref={contentScrollRef}
          className="flex-1 overflow-y-auto p-4 pb-8 space-y-4"
        >
          {/* 2. LARGE PRODUCT IMAGE & 3. IMAGE SLIDER */}
          <div className="flex flex-col items-center">
            <div
              ref={sliderRef}
              id="product-details-slider"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ aspectRatio: '4 / 3' }}
              className="relative w-full aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing border border-gray-100 shadow-xs touch-pan-y"
            >
              {/* Native Web Share Button at top-right of image */}
              <button
                type="button"
                id="image-slider-share-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareProduct();
                }}
                aria-label="Share product"
                title="Share product"
                className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-[#FF8C00] shadow-sm flex items-center justify-center cursor-pointer transition-all active:scale-95 border border-gray-100"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* SMOOTH HORIZONTAL SLIDER TRACK */}
              <div
                className="flex h-full w-full"
                style={{
                  transform: `translateX(calc(-${activeImgIndex * 100}% + ${dragOffset}px))`,
                  transition: isDragging
                    ? 'none'
                    : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
                  willChange: 'transform',
                }}
              >
                {images.map((src, idx) => (
                  <div
                    key={idx}
                    className="h-full flex-shrink-0 flex items-center justify-center p-4"
                    style={{ minWidth: '100%', width: '100%' }}
                  >
                    <img
                      src={src}
                      alt={`${product.name} - View ${idx + 1}`}
                      style={{ objectFit: 'contain' }}
                      className="w-full h-full object-contain pointer-events-none select-none"
                      referrerPolicy="no-referrer"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ONLY PAGINATION DOTS BELOW THE IMAGE (NO ARROWS) */}
            {images.length > 1 && (
              <div
                id="slider-pagination-dots"
                className="flex justify-center items-center gap-2 mt-3 mb-1"
                aria-label="Image slider pagination"
              >
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all rounded-full cursor-pointer ${
                      activeImgIndex === idx
                        ? 'w-3 h-3 bg-[#FF8C00]'
                        : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 4. MAIN PRODUCT INFORMATION */}
          <div className="space-y-2">
            {/* Rating, In Stock Badge, 15-Min Delivery */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {ratingStats.reviewCount > 0 && ratingStats.rating !== null ? (
                  <button
                    type="button"
                    id="product-details-rating-badge"
                    onClick={() => {
                      const el = document.getElementById('section-ratings-reviews');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    title="View Customer Ratings & Reviews"
                    className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold text-amber-800 cursor-pointer transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{ratingStats.rating.toFixed(1)}</span>
                    <span className="text-gray-400 font-normal">
                      ({ratingStats.reviewCount})
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="product-details-rating-badge"
                    onClick={() => {
                      const el = document.getElementById('section-ratings-reviews');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    title="Read reviews or write the first review"
                    className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[11px] font-medium text-gray-500 cursor-pointer transition-colors"
                  >
                    <span>No reviews yet</span>
                  </button>
                )}
                <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  In Stock
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[#FF8C00]">
                <Zap className="w-3.5 h-3.5 fill-[#FF8C00]" />
                <span>15-Min Delivery</span>
              </div>
            </div>

            {/* Product Name */}
            <h2 className="text-lg font-bold text-[#0B1528] leading-snug pt-1">
              {product.name}
            </h2>

            {/* Pricing Row */}
            <div className="flex items-center gap-3 pt-0.5">
              <span className="text-2xl font-extrabold text-[#0B1528]">
                ₹{product.price}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through font-medium">
                  ₹{originalPrice}
                </span>
              )}
              {discountPercent && (
                <span className="text-xs font-bold text-[#FF8C00] bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-md">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Taxes & Delivery Info */}
            <p className="text-xs text-gray-500 pt-0.5">
              Inclusive of all taxes • Pay on Delivery available
            </p>

            {/* Notify me of price drops */}
            <div className="pt-2">
              <button
                type="button"
                id="btn-notify-price-drops"
                onClick={() => setIsPriceDropOpen(!isPriceDropOpen)}
                className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>{isPriceDropOpen ? 'Close Price Drop Alert' : 'Notify me of price drops'}</span>
              </button>

              <AnimatePresence>
                {isPriceDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pt-2"
                  >
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!priceDropEmail || !priceDropEmail.includes('@')) {
                          showModalToast('Please enter a valid email address.');
                          return;
                        }
                        setPriceDropSubscribed(true);
                        showModalToast(`Success! We'll notify ${priceDropEmail} if ${product.name} price drops.`);
                        setTimeout(() => {
                          setIsPriceDropOpen(false);
                          setPriceDropSubscribed(false);
                          setPriceDropEmail('');
                        }, 2500);
                      }}
                      className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 space-y-2 text-xs"
                    >
                      <p className="text-amber-900 font-semibold leading-snug">
                        Get notified when <span className="underline font-bold">{product.name}</span> goes on sale!
                      </p>
                      {priceDropSubscribed ? (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-lg font-medium text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Subscribed! We'll email you on price drops.</span>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="email"
                            required
                            placeholder="Enter your email address"
                            value={priceDropEmail}
                            onChange={(e) => setPriceDropEmail(e.target.value)}
                            className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-[#0B1528] focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
                          />
                          <button
                            type="submit"
                            className="bg-[#0B1528] hover:bg-[#1a2b4c] text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shrink-0 shadow-xs"
                          >
                            Notify Me
                          </button>
                        </div>
                      )}
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 1: DELIVERY DETAILS */}
          {/* ======================================================== */}
          <div
            id="section-delivery-details"
            className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3.5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100/70 text-[#FF8C00] flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0B1528]">Delivery Details</h3>
                  <p className="text-[10px] text-gray-500">Live ETA &amp; address</p>
                </div>
              </div>

              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  id="btn-change-delivery-address"
                  onClick={() => setIsAddressPickerOpen(!isAddressPickerOpen)}
                  className="text-xs font-bold text-[#FF8C00] hover:underline cursor-pointer"
                >
                  {isAddressPickerOpen ? 'Done' : 'Change Address'}
                </button>
              )}
            </div>

            {/* Active delivery address card */}
            {activeAddress ? (
              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF8C00] shrink-0" />
                    <span className="text-xs font-bold text-[#0B1528]">
                      {activeAddress.fullName}
                    </span>
                    {activeAddress.isDefault && (
                      <span className="text-[9px] font-bold bg-[#FF8C00] text-white px-1.5 py-0.2 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    +91 {activeAddress.mobile}
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {activeAddress.building}, {activeAddress.street}
                  {activeAddress.landmark ? `, ${activeAddress.landmark}` : ''}, {activeAddress.city}, {activeAddress.state} - <span className="font-bold text-[#0B1528]">{activeAddress.pincode}</span>
                </p>

                {/* Dynamic Estimated Delivery & Shipping Fee calculation */}
                <div className="pt-2 border-t border-gray-100 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Estimated Delivery:</span>
                    <span className="font-bold text-emerald-700">
                      {estimatedDeliveryDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Delivery Charge:</span>
                    <span className="font-bold text-[#0B1528]">
                      {deliveryCalc.isFree ? (
                        <span className="text-emerald-700 font-bold uppercase text-[11px]">
                          Free Delivery
                        </span>
                      ) : (
                        <span>
                          ₹{deliveryCalc.fee}{' '}
                          <span className="text-[10px] text-gray-400 font-normal">
                            ({deliveryCalc.zone})
                          </span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-3 border border-gray-100 text-center text-xs text-gray-500">
                No delivery address saved yet.
              </div>
            )}

            {/* Address Picker Dropdown / Selector */}
            {isAddressPickerOpen && savedAddresses.length > 0 && (
              <div className="bg-white rounded-xl p-3 border border-orange-200 shadow-sm space-y-2 mt-1">
                <div className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
                  <span>Select Saved Address</span>
                  <span className="text-[10px] text-gray-400">({savedAddresses.length} available)</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                  {savedAddresses.map((addr) => {
                    const isSelected = activeAddress?.id === addr.id;
                    return (
                      <div
                        key={addr.id}
                        id={`select-addr-${addr.id}`}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'border-[#FF8C00] bg-orange-50/40 shadow-xs'
                            : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0B1528] truncate">{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-bold bg-[#FF8C00] text-white px-1.5 py-0.2 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 line-clamp-1">
                            {addr.building}, {addr.street}, {addr.city} - {addr.pincode}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'border-[#FF8C00] bg-[#FF8C00] text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: SHOP WITH PEACE OF MIND */}
          {/* ======================================================== */}
          <div
            id="section-peace-of-mind"
            className="bg-white border border-gray-100 rounded-2xl p-3.5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#0B1528]">Shop With Peace of Mind</h3>
                <p className="text-[10px] text-gray-500">Tap any option to view verified terms</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {/* Cancellation */}
              <button
                type="button"
                id="btn-policy-cancellation"
                onClick={() => setSelectedPolicy('cancellation')}
                className="p-3 bg-gray-50 hover:bg-orange-50/40 border border-gray-100 hover:border-orange-200 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 text-[#0B1528] flex items-center justify-center shrink-0 group-hover:text-[#FF8C00]">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#0B1528] block truncate">
                    Cancellation
                  </span>
                  <span className="text-[10px] text-gray-400 block truncate">Zero penalty</span>
                </div>
              </button>

              {/* 7-Day Return */}
              <button
                type="button"
                id="btn-policy-return"
                onClick={() => setSelectedPolicy('return')}
                className="p-3 bg-gray-50 hover:bg-orange-50/40 border border-gray-100 hover:border-orange-200 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 text-[#0B1528] flex items-center justify-center shrink-0 group-hover:text-[#FF8C00]">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#0B1528] block truncate">
                    7-Day Return
                  </span>
                  <span className="text-[10px] text-gray-400 block truncate">Free replacement</span>
                </div>
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                id="btn-policy-cod"
                onClick={() => setSelectedPolicy('cod')}
                className="p-3 bg-gray-50 hover:bg-orange-50/40 border border-gray-100 hover:border-orange-200 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 text-[#0B1528] flex items-center justify-center shrink-0 group-hover:text-[#FF8C00]">
                  <Banknote className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#0B1528] block truncate">
                    Cash on Delivery
                  </span>
                  <span className="text-[10px] text-gray-400 block truncate">Cash or UPI QR</span>
                </div>
              </button>

              {/* Warranty */}
              <button
                type="button"
                id="btn-policy-warranty"
                onClick={() => setSelectedPolicy('warranty')}
                className="p-3 bg-gray-50 hover:bg-orange-50/40 border border-gray-100 hover:border-orange-200 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 text-[#0B1528] flex items-center justify-center shrink-0 group-hover:text-[#FF8C00]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#0B1528] block truncate">
                    Warranty
                  </span>
                  <span className="text-[10px] text-gray-400 block truncate">6-Month brand cover</span>
                </div>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: RATINGS & REVIEWS (Simulated API Component) */}
          {/* ======================================================== */}
          <Review
            productId={product.id}
            productName={product.name}
            onRatingStatsChange={setRatingStats}
          />

          {/* ======================================================== */}
          {/* SECTION 4: ALL DETAILS (Horizontally Scrollable Tabs) */}
          {/* ======================================================== */}
          <div
            id="section-all-details"
            className="bg-white border border-gray-100 rounded-2xl p-3.5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#0B1528]">All Details</h3>
              <span className="text-[10px] text-gray-400">Official Product Specifications</span>
            </div>

            {/* Horizontally scrollable tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-gray-100">
              {(['Specifications', 'Description', 'Warranty', 'Manufacturer Info'] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    id={`tab-details-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setActiveDetailsTab(tab)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                      activeDetailsTab === tab
                        ? 'bg-[#0B1528] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* Tab Content */}
            <div className="pt-1 text-xs">
              {/* Specifications Tab */}
              {activeDetailsTab === 'Specifications' && (
                product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
                    {Object.entries(product.specifications).map(([key, val], idx) => (
                      <div
                        key={key}
                        className={`p-2.5 flex items-start justify-between gap-4 text-xs ${
                          idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                        }`}
                      >
                        <span className="text-gray-500 font-medium shrink-0 max-w-[45%]">
                          {key}
                        </span>
                        <span className="text-[#0B1528] font-bold text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500 font-medium bg-gray-50 rounded-xl border border-gray-100">
                    Not available
                  </div>
                )
              )}

              {/* Description Tab */}
              {activeDetailsTab === 'Description' && (
                product.description && product.description.trim() ? (
                  <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-700 leading-relaxed">{product.description}</p>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500 font-medium bg-gray-50 rounded-xl border border-gray-100">
                    Not available
                  </div>
                )
              )}

              {/* Warranty Tab */}
              {activeDetailsTab === 'Warranty' && (
                product.warranty && product.warranty.trim() ? (
                  <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1528]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Warranty Coverage</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{product.warranty}</p>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500 font-medium bg-gray-50 rounded-xl border border-gray-100">
                    Not available
                  </div>
                )
              )}

              {/* Manufacturer Info Tab */}
              {activeDetailsTab === 'Manufacturer Info' && (
                product.manufacturerInfo &&
                Object.values(product.manufacturerInfo).some(Boolean) ? (
                  <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
                    {product.manufacturerInfo.name && (
                      <div className="p-2.5 flex items-start justify-between gap-4 text-xs bg-gray-50/50">
                        <span className="text-gray-500 font-medium shrink-0">Manufacturer</span>
                        <span className="text-[#0B1528] font-bold text-right">
                          {product.manufacturerInfo.name}
                        </span>
                      </div>
                    )}
                    {product.manufacturerInfo.address && (
                      <div className="p-2.5 flex items-start justify-between gap-4 text-xs bg-white">
                        <span className="text-gray-500 font-medium shrink-0">Address</span>
                        <span className="text-[#0B1528] font-medium text-right leading-snug">
                          {product.manufacturerInfo.address}
                        </span>
                      </div>
                    )}
                    {product.manufacturerInfo.countryOfOrigin && (
                      <div className="p-2.5 flex items-start justify-between gap-4 text-xs bg-gray-50/50">
                        <span className="text-gray-500 font-medium shrink-0">Country of Origin</span>
                        <span className="text-[#0B1528] font-bold text-right">
                          {product.manufacturerInfo.countryOfOrigin}
                        </span>
                      </div>
                    )}
                    {product.manufacturerInfo.packer && (
                      <div className="p-2.5 flex items-start justify-between gap-4 text-xs bg-white">
                        <span className="text-gray-500 font-medium shrink-0">Packer</span>
                        <span className="text-[#0B1528] font-medium text-right leading-snug">
                          {product.manufacturerInfo.packer}
                        </span>
                      </div>
                    )}
                    {product.manufacturerInfo.importer && (
                      <div className="p-2.5 flex items-start justify-between gap-4 text-xs bg-gray-50/50">
                        <span className="text-gray-500 font-medium shrink-0">Importer</span>
                        <span className="text-[#0B1528] font-medium text-right leading-snug">
                          {product.manufacturerInfo.importer}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500 font-medium bg-gray-50 rounded-xl border border-gray-100">
                    Not available
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* STICKY BOTTOM ACTION BAR */}
        {onAddToCart && (
          <div className="p-3.5 bg-white border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 shadow-lg">
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">
                Price
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-[#001f3f]">
                  ₹{product.price}
                </span>
                {originalPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{originalPrice}
                  </span>
                )}
              </div>
            </div>

            <motion.button
              type="button"
              id="btn-modal-add-to-basket"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onAddToCart(product);
                setIsAddedToCart(true);
                setTimeout(() => setIsAddedToCart(false), 1500);
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                isAddedToCart
                  ? 'bg-[#001f3f] text-white'
                  : 'bg-[#FF8C00] hover:bg-orange-600 text-white'
              }`}
            >
              {isAddedToCart ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Added to Basket</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Basket</span>
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* SHOP WITH PEACE OF MIND POLICY MODAL */}
        <AnimatePresence>
          {selectedPolicy && (
            <div
              id="peace-of-mind-modal-backdrop"
              className="fixed inset-0 z-60 bg-black/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                className="w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-100/60 text-[#FF8C00] flex items-center justify-center shrink-0">
                      {PEACE_OF_MIND_POLICIES[selectedPolicy].icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0B1528]">
                        {PEACE_OF_MIND_POLICIES[selectedPolicy].title}
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full inline-block mt-0.5">
                        {PEACE_OF_MIND_POLICIES[selectedPolicy].badge}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPolicy(null)}
                    aria-label="Close policy modal"
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-gray-600 font-medium">
                  {PEACE_OF_MIND_POLICIES[selectedPolicy].subtitle}
                </p>

                <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {PEACE_OF_MIND_POLICIES[selectedPolicy].highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{h}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPolicy(null)}
                  className="w-full py-2.5 bg-[#0B1528] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Got It
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
