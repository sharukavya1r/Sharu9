import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

const THRESHOLD = 65; // Pull distance to trigger refresh (px)
const MAX_PULL = 90; // Maximum allowed pull distance (px)

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  disabled = false,
  scrollContainerRef,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isTrackingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);

  pullDistanceRef.current = pullDistance;
  isRefreshingRef.current = isRefreshing;

  const getScrollTop = useCallback(() => {
    if (scrollContainerRef?.current) {
      return scrollContainerRef.current.scrollTop;
    }
    return window.scrollY || document.documentElement.scrollTop;
  }, [scrollContainerRef]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPullDistance(52); // Keep indicator visible during refresh

    try {
      await onRefresh();
      setJustCompleted(true);
      setTimeout(() => {
        setJustCompleted(false);
        setPullDistance(0);
        setIsRefreshing(false);
      }, 500);
    } catch (err) {
      console.error('Error during refresh:', err);
      setPullDistance(0);
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshingRef.current) return;
    if (getScrollTop() <= 2) {
      startYRef.current = e.touches[0].clientY;
      startXRef.current = e.touches[0].clientX;
      isTrackingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTrackingRef.current || disabled || isRefreshingRef.current) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = currentY - startYRef.current;
    const diffX = currentX - startXRef.current;

    // Check if user is scrolling down from the very top and vertically
    if (getScrollTop() <= 0 && diffY > 0) {
      // Prioritize vertical gestures over horizontal swipe (e.g., carousel)
      if (Math.abs(diffY) > Math.abs(diffX) * 1.1) {
        if (!isPulling) {
          setIsPulling(true);
        }
        // Apply smooth logarithmic dampening
        const damped = Math.min(MAX_PULL, diffY * 0.42);
        setPullDistance(damped);
      }
    } else {
      if (isPulling) {
        setIsPulling(false);
        setPullDistance(0);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isTrackingRef.current) return;
    isTrackingRef.current = false;
    setIsPulling(false);

    if (pullDistanceRef.current >= THRESHOLD && !isRefreshingRef.current) {
      handleRefresh();
    } else if (!isRefreshingRef.current) {
      setPullDistance(0);
    }
  };

  // Mouse Drag Handlers for Desktop Simulation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isRefreshingRef.current) return;
    if (getScrollTop() <= 2) {
      startYRef.current = e.clientY;
      startXRef.current = e.clientX;
      isTrackingRef.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isTrackingRef.current || disabled || isRefreshingRef.current) return;
    if (e.buttons !== 1) {
      isTrackingRef.current = false;
      return;
    }

    const currentY = e.clientY;
    const currentX = e.clientX;
    const diffY = currentY - startYRef.current;
    const diffX = currentX - startXRef.current;

    if (getScrollTop() <= 0 && diffY > 0) {
      if (Math.abs(diffY) > Math.abs(diffX) * 1.1) {
        if (!isPulling) {
          setIsPulling(true);
        }
        const damped = Math.min(MAX_PULL, diffY * 0.42);
        setPullDistance(damped);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isTrackingRef.current) return;
    isTrackingRef.current = false;
    setIsPulling(false);

    if (pullDistanceRef.current >= THRESHOLD && !isRefreshingRef.current) {
      handleRefresh();
    } else if (!isRefreshingRef.current) {
      setPullDistance(0);
    }
  };

  const pullPercentage = Math.min(100, Math.round((pullDistance / THRESHOLD) * 100));
  const isReadyToRelease = pullDistance >= THRESHOLD;

  return (
    <div
      id="pull-to-refresh-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full min-h-full"
    >
      {/* Visual Pull Indicator Banner */}
      <div
        id="pull-to-refresh-indicator"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 8 ? Math.min(1, pullDistance / 35) : 0,
          transition: isPulling ? 'none' : 'height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease',
        }}
        className="w-full overflow-hidden flex items-center justify-center pointer-events-none select-none"
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-orange-200/80 shadow-xs text-xs font-semibold text-[#001f3f]">
          {isRefreshing ? (
            <>
              <RefreshCw className="w-4 h-4 text-[#FF8C00] animate-spin" />
              <span className="text-[11px] font-bold text-[#FF8C00]">Updating QukeBasket...</span>
            </>
          ) : justCompleted ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span className="text-[11px] font-bold text-emerald-700">Updated!</span>
            </>
          ) : isReadyToRelease ? (
            <>
              <motion.div
                animate={{ rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowDown className="w-4 h-4 text-[#FF8C00] stroke-[2.5]" />
              </motion.div>
              <span className="text-[11px] font-bold text-[#FF8C00]">Release to refresh</span>
            </>
          ) : (
            <>
              <div
                style={{ transform: `rotate(${pullPercentage * 1.8}deg)` }}
                className="transition-transform duration-75 text-gray-500"
              >
                <ArrowDown className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <span className="text-[10px] text-gray-600 font-medium">
                Pull down to refresh ({pullPercentage}%)
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content with smooth spring motion during pull & release */}
      <div
        id="pull-to-refresh-content"
        style={{
          transform: `translate3d(0, ${isRefreshing || isPulling ? 0 : 0}px, 0)`,
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="w-full"
      >
        {children}
      </div>
    </div>
  );
};
