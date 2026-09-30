import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Truck,
  Package,
  Clock,
  MapPin,
  X,
  PhoneCall,
  ShoppingBag,
  ShieldAlert,
  AlertTriangle,
  Camera,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Lock,
  Sparkles,
  Info,
  Ban,
  RotateCcw,
  Eye,
  CreditCard,
  Banknote,
  Star,
} from 'lucide-react';
import { Order, DamageClaim, ClaimStatus, OrderStatus, ProductItem } from '../types';
import { DamageClaimModal } from './DamageClaimModal';
import { getClaimWindowInfo } from '../utils/claimUtils';

interface OrdersViewProps {
  orders: Order[];
  onBackToShopping: () => void;
  showToast: (msg: string) => void;
  onUpdateOrder: (updatedOrder: Order) => void;
  onReorder?: (items: Order['items']) => void;
  isLoggedIn?: boolean;
  onSelectProduct?: (product: ProductItem) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onBackToShopping,
  showToast,
  onUpdateOrder,
  onReorder,
  isLoggedIn = false,
  onSelectProduct,
}) => {
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);
  const [cancelTargetOrder, setCancelTargetOrder] = useState<Order | null>(null);
  const [selectedClaimOrder, setSelectedClaimOrder] = useState<Order | null>(null);
  const [isClaimModalAdminMode, setIsClaimModalAdminMode] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'delivered' | 'claims'>('all');
  const [cancelReason, setCancelReason] = useState<string>('Ordered by mistake');

  // Real-time ticking counter so all countdown timers on order cards tick every second
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenClaimModal = (order: Order, adminMode: boolean = false) => {
    setSelectedClaimOrder(order);
    setIsClaimModalAdminMode(adminMode);
  };

  const handleConfirmCancel = () => {
    if (!cancelTargetOrder) return;
    const updated: Order = {
      ...cancelTargetOrder,
      status: 'Cancelled',
    };
    onUpdateOrder(updated);
    setCancelTargetOrder(null);
    showToast(`Order #${cancelTargetOrder.id} has been cancelled.`);
  };

  const handleReorderItems = (order: Order) => {
    if (onReorder) {
      onReorder(order.items);
      showToast(`${order.items.length} item${order.items.length === 1 ? '' : 's'} added to cart!`);
    } else {
      showToast('Items added to cart!');
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'delivered') return order.status === 'Delivered';
    if (activeFilter === 'claims') return !!order.damageClaim;
    return true;
  });

  const claimsCount = orders.filter((o) => !!o.damageClaim).length;
  const underReviewCount = orders.filter(
    (o) =>
      o.damageClaim &&
      (o.damageClaim.status === 'Under Review' || o.damageClaim.status === 'Pending Review')
  ).length;

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Cancelled':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Out for Delivery':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Preparing':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Confirmed':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Order Placed':
      default:
        return 'text-[#FF8C00] bg-orange-50 border-orange-200';
    }
  };

  const TRACKING_STEPS: OrderStatus[] = [
    'Order Placed',
    'Confirmed',
    'Preparing',
    'Out for Delivery',
    'Delivered',
  ];

  const getStepIndex = (status: OrderStatus): number => {
    const idx = TRACKING_STEPS.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Orders Subheader: Order count & Shop More action */}
      <div className="flex items-center justify-between pt-0.5">
        <p className="text-xs font-semibold text-gray-500">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
        </p>

        <button
          type="button"
          onClick={onBackToShopping}
          className="text-xs font-bold text-[#FF8C00] hover:underline cursor-pointer"
        >
          + Shop More
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-white text-[#001f3f] shadow-sm font-bold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('delivered')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
            activeFilter === 'delivered'
              ? 'bg-white text-[#001f3f] shadow-sm font-bold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Delivered ({orders.filter((o) => o.status === 'Delivered').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('claims')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer relative ${
            activeFilter === 'claims'
              ? 'bg-white text-[#001f3f] shadow-sm font-bold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Claims ({claimsCount})
          {underReviewCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-[#FF8C00] text-white text-[9px] font-black rounded-full">
              {underReviewCount}
            </span>
          )}
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-[#FF8C00] flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-[#001f3f]">
            {activeFilter === 'claims' ? 'No damage claims yet' : 'No orders yet'}
          </h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            {activeFilter === 'claims'
              ? 'Any damage or defective claims filed within 1 hour of delivery will appear here.'
              : 'Explore genuine mobile accessories with 100% authentic brand warranty!'}
          </p>
          <button
            type="button"
            onClick={onBackToShopping}
            className="px-5 py-2.5 bg-[#FF8C00] hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const hasDelivered = order.status === 'Delivered';
            const isCancelled = order.status === 'Cancelled';
            const canCancel = ['Order Placed', 'Confirmed', 'Preparing'].includes(order.status);
            const windowInfo = getClaimWindowInfo(order.deliveredAt, now);
            const claim = order.damageClaim;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3"
              >
                {/* Top Order Meta */}
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-extrabold text-[#001f3f]">
                      Order #{order.id}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {order.deliveredDateFormatted
                        ? `Delivered: ${order.deliveredDateFormatted}`
                        : order.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                        order.status
                      )}`}
                    >
                      {order.status === 'Delivered' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : order.status === 'Cancelled' ? (
                        <Ban className="w-3 h-3 text-rose-600" />
                      ) : (
                        <Truck className="w-3 h-3 text-[#FF8C00]" />
                      )}
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-gray-50/70 transition-colors"
                    >
                      <div
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        onClick={() => onSelectProduct && onSelectProduct(item)}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-lg object-contain bg-gray-50 border border-gray-100 p-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-[#001f3f] truncate hover:text-[#FF8C00]">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-gray-400">
                            Qty: {item.quantity} •{' '}
                            <span className="font-bold text-[#FF8C00]">
                              ₹{item.price * item.quantity}
                            </span>
                          </p>
                        </div>
                      </div>

                      {hasDelivered && onSelectProduct && (
                        <button
                          type="button"
                          onClick={() => onSelectProduct(item)}
                          className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                          title="Write a review for this purchased product"
                        >
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>Write Review</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Order Summary Line */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
                  <div className="text-gray-400 text-[11px]">
                    Total:{' '}
                    <span className="font-extrabold text-[#001f3f] text-xs">
                      ₹{order.totalAmount}
                    </span>{' '}
                    • {order.paymentMethod}
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailsOrder(order)}
                    className="text-xs font-bold text-[#001f3f] hover:text-[#FF8C00] flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Damage Claim Section for Delivered Orders */}
                {hasDelivered && (
                  <div className="pt-1">
                    {claim ? (
                      /* ACTIVE CLAIM PREVIEW CARD */
                      <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-[#FF8C00]" />
                            <span className="text-xs font-black text-[#001f3f]">
                              Damage Claim #{claim.id}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              claim.status === 'Approved – Replacement'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : claim.status === 'Approved – Refund'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : claim.status === 'Under Review'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : claim.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : claim.status === 'Completed'
                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {claim.status === 'Under Review' && (
                              <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                            )}
                            {claim.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 p-2 rounded-lg border border-orange-100">
                          <div>
                            <span className="text-gray-400 block text-[10px]">Reason</span>
                            <span className="font-bold text-[#001f3f]">{claim.reason}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">Resolution</span>
                            <span className="font-bold text-emerald-700">
                              {claim.preferredResolution}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-[#FF8C00]" />
                            {claim.photos.length} photo{claim.photos.length === 1 ? '' : 's'} proof
                            {claim.video && ' • 🎬 Video attached'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(claim.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleOpenClaimModal(order, false)}
                            className="flex-1 py-1.5 bg-white border border-gray-200 hover:border-[#FF8C00] text-[#001f3f] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                          >
                            View Claim Details &amp; Proof
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenClaimModal(order, true)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Open claims admin review desk"
                          >
                            <Lock className="w-3 h-3 text-[#FF8C00]" />
                            <span>Admin Desk</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* NO CLAIM YET: LIVE 1-HOUR COUNTDOWN TIMER & REPORT BUTTON */
                      <div
                        className={`rounded-xl p-3 border space-y-2 ${
                          windowInfo.isExpired
                            ? 'bg-gray-50 border-gray-200 text-gray-600'
                            : 'bg-orange-50/70 border-orange-200 text-amber-950'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          {!windowInfo.isExpired ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="font-extrabold text-xs text-[#001f3f]">
                                Damage claim window: {windowInfo.minutes}m{' '}
                                <span className="text-[#FF8C00] font-mono">
                                  {windowInfo.seconds.toString().padStart(2, '0')}s
                                </span>{' '}
                                remaining
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>Claim window expired (within 1 hr of delivery)</span>
                            </div>
                          )}

                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              windowInfo.isExpired
                                ? 'bg-gray-200 text-gray-600 border-gray-300'
                                : 'bg-white text-orange-800 border-orange-200'
                            }`}
                          >
                            {windowInfo.isExpired ? 'Expired' : '1-Hr Window'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <p className="text-[10px] text-gray-500 leading-tight">
                            {windowInfo.isExpired
                              ? 'Transit damage must be reported within 1 hr of delivery.'
                              : 'Broken or damaged accessory? File claim for replacement.'}
                          </p>

                          <button
                            type="button"
                            onClick={() => handleOpenClaimModal(order, false)}
                            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg shrink-0 transition-colors cursor-pointer border ${
                              windowInfo.isExpired
                                ? 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100'
                                : 'bg-[#FF8C00] hover:bg-orange-600 text-white border-[#FF8C00] shadow-sm'
                            }`}
                          >
                            Report an Issue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Main Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => setTrackingOrder(order)}
                      className="flex-1 py-2 bg-[#001f3f] hover:bg-[#FF8C00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </button>
                  )}

                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => setCancelTargetOrder(order)}
                      className="px-3 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Ban className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  )}

                  {hasDelivered && (
                    <button
                      type="button"
                      onClick={() => handleOpenClaimModal(order, false)}
                      className="px-3 py-2 border border-gray-200 hover:border-[#FF8C00] hover:bg-orange-50/50 text-gray-700 hover:text-[#001f3f] text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ShieldAlert className="w-3 h-3 text-[#FF8C00]" />
                      <span>{claim ? 'View Claim' : 'Report Issue'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleReorderItems(order)}
                    className="px-3 py-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="Add items to cart"
                  >
                    <RotateCcw className="w-3 h-3 text-gray-500" />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-end justify-center">
          <div className="w-full max-w-[390px] bg-white rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#FF8C00]" />
                <h3 className="font-bold text-sm text-[#001f3f]">
                  Track Order #{trackingOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Status Pill */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">
                  Status
                </span>
                <span className="text-xs font-extrabold text-[#001f3f]">
                  {trackingOrder.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">
                  Delivery
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {trackingOrder.deliveredDateFormatted || trackingOrder.estimatedDelivery || 'In Progress'}
                </span>
              </div>
            </div>

            {/* Tracking Milestones */}
            {trackingOrder.status === 'Cancelled' ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-1">
                <Ban className="w-6 h-6 text-rose-600 mx-auto" />
                <h4 className="font-bold text-xs text-rose-900">This order was cancelled</h4>
                <p className="text-[11px] text-rose-700">
                  No further delivery attempts will be made for Order #{trackingOrder.id}.
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-2 pl-2">
                {TRACKING_STEPS.map((step, idx) => {
                  const currentIdx = getStepIndex(trackingOrder.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step} className="flex items-start gap-3 relative">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div
                        className={`pb-4 border-l-2 pl-4 -ml-6 pt-0.5 flex-1 ${
                          idx < TRACKING_STEPS.length - 1
                            ? isDone && idx < currentIdx
                              ? 'border-emerald-500'
                              : 'border-gray-200'
                            : 'border-transparent'
                        }`}
                      >
                        <h4
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-[#FF8C00]'
                              : isDone
                              ? 'text-[#001f3f]'
                              : 'text-gray-400'
                          }`}
                        >
                          {step}
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          {idx === 0
                            ? trackingOrder.date
                            : isDone
                            ? 'Completed'
                            : 'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Destination Address */}
            {trackingOrder.deliveryAddress && (
              <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 border border-gray-100">
                <span className="font-bold text-[#001f3f] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF8C00]" />
                  Delivery Destination
                </span>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  {trackingOrder.deliveryAddress.fullName},{' '}
                  {trackingOrder.deliveryAddress.addressLine},{' '}
                  {trackingOrder.deliveryAddress.city}, {trackingOrder.deliveryAddress.state} -{' '}
                  {trackingOrder.deliveryAddress.pincode}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {detailsOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-end justify-center">
          <div className="w-full max-w-[390px] bg-white rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-sm text-[#001f3f]">
                  Order #{detailsOrder.id} Details
                </h3>
                <p className="text-[10px] text-gray-400">{detailsOrder.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsOrder(null)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status & Payment */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Status</span>
                <span className="font-extrabold text-[#001f3f]">{detailsOrder.status}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Payment</span>
                <span className="font-extrabold text-[#001f3f]">{detailsOrder.paymentMethod}</span>
              </div>
            </div>

            {/* Ordered Items Breakdown */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#001f3f] block">
                Ordered Items ({detailsOrder.items.length})
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {detailsOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-contain rounded-lg bg-white border border-gray-100 p-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[#001f3f] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        Qty: {item.quantity} • ₹{item.price} each
                      </p>
                    </div>
                    <span className="font-bold text-xs text-[#001f3f]">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs border border-gray-100">
              <div className="flex justify-between text-gray-500 text-[11px]">
                <span>Items Subtotal</span>
                <span>
                  ₹
                  {detailsOrder.subtotal ||
                    detailsOrder.items.reduce((s, it) => s + it.price * it.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500 text-[11px]">
                <span>Delivery Charges</span>
                <span>
                  {detailsOrder.deliveryCharge ? `₹${detailsOrder.deliveryCharge}` : 'FREE'}
                </span>
              </div>
              <div className="pt-1.5 border-t border-gray-200 flex justify-between font-extrabold text-[#001f3f]">
                <span>Total Amount Paid</span>
                <span className="text-[#FF8C00] text-sm">₹{detailsOrder.totalAmount}</span>
              </div>
            </div>

            {/* Delivery Address */}
            {detailsOrder.deliveryAddress && (
              <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 border border-gray-100">
                <span className="font-bold text-[#001f3f] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF8C00]" />
                  Shipping Address
                </span>
                <p className="text-gray-700 font-semibold">{detailsOrder.deliveryAddress.fullName}</p>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  {detailsOrder.deliveryAddress.addressLine}, {detailsOrder.deliveryAddress.city},{' '}
                  {detailsOrder.deliveryAddress.state} - {detailsOrder.deliveryAddress.pincode}
                </p>
                <p className="text-gray-500 text-[11px]">
                  Phone: {detailsOrder.deliveryAddress.phone}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleReorderItems(detailsOrder);
                  setDetailsOrder(null);
                }}
                className="flex-1 py-2.5 bg-[#FF8C00] hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Reorder Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancelTargetOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-white rounded-3xl p-5 space-y-4 shadow-2xl border border-gray-100">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <Ban className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#001f3f]">
                Cancel Order #{cancelTargetOrder.id}?
              </h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-700 block">
                Reason for cancellation:
              </label>
              {[
                'Ordered by mistake',
                'Found a better price',
                'Delivery time is too long',
                'Changed mind / Other',
              ].map((r) => (
                <label
                  key={r}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer ${
                    cancelReason === r
                      ? 'border-[#FF8C00] bg-orange-50/50 font-bold text-[#001f3f]'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <span>{r}</span>
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={cancelReason === r}
                    onChange={() => setCancelReason(r)}
                    className="w-3.5 h-3.5 text-[#FF8C00]"
                  />
                </label>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelTargetOrder(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Damage Claim Modal */}
      {selectedClaimOrder && (
        <DamageClaimModal
          order={selectedClaimOrder}
          isOpen={!!selectedClaimOrder}
          onClose={() => setSelectedClaimOrder(null)}
          onUpdateOrder={(updated) => {
            onUpdateOrder(updated);
            setSelectedClaimOrder(updated);
          }}
          showToast={showToast}
          initialAdminMode={isClaimModalAdminMode}
        />
      )}
    </div>
  );
};
