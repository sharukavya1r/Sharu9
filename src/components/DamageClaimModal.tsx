import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  Upload,
  Camera,
  Video,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  FileCheck,
  RefreshCw,
  Eye,
  Trash2,
  Lock,
  ChevronRight,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Order,
  DamageClaim,
  ClaimStatus,
  ClaimReason,
} from '../types';
import { getClaimWindowInfo } from '../utils/claimUtils';
import { generateClaimId } from '../services/orderService';

interface DamageClaimModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrder: (updatedOrder: Order) => void;
  showToast: (msg: string) => void;
  initialAdminMode?: boolean;
}

const CLAIM_REASONS: ClaimReason[] = [
  'Product damaged',
  'Product broken',
  'Wrong product received',
  'Missing item',
  'Other issue',
];

const CLAIM_STATUSES: ClaimStatus[] = [
  'Pending Review',
  'Under Review',
  'Approved – Replacement',
  'Approved – Refund',
  'Rejected',
  'Completed',
];

export const DamageClaimModal: React.FC<DamageClaimModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateOrder,
  showToast,
  initialAdminMode = false,
}) => {
  // Real live ticking clock every 1 second
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>(
    order.items[0]?.id || ''
  );
  const [selectedReason, setSelectedReason] = useState<ClaimReason>('Product damaged');
  const [preferredResolution, setPreferredResolution] = useState<
    'Replacement preferred' | 'Refund requested'
  >('Replacement preferred');
  const [description, setDescription] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoData, setVideoData] = useState<{ url: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Admin desk toggle
  const [isAdminMode, setIsAdminMode] = useState<boolean>(initialAdminMode);
  const [adminStatus, setAdminStatus] = useState<ClaimStatus>(
    order.damageClaim?.status || 'Under Review'
  );
  const [adminNotes, setAdminNotes] = useState<string>(
    order.damageClaim?.adminNotes || ''
  );

  // File input refs
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate live window info using order's deliveredAt timestamp
  const isDelivered = order.status === 'Delivered' && !!order.deliveredAt;
  const windowInfo = getClaimWindowInfo(order.deliveredAt, now);

  // Sync admin status if order changes
  useEffect(() => {
    if (order.damageClaim) {
      setAdminStatus(order.damageClaim.status);
      setAdminNotes(order.damageClaim.adminNotes || '');
    }
  }, [order.damageClaim]);

  // Handle Photo Upload (up to 5 photos)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - photos.length;
    if (remainingSlots <= 0) {
      showToast('Maximum 5 photos allowed');
      return;
    }

    const filesToProcess: File[] = Array.from(files).slice(0, remainingSlots) as File[];
    filesToProcess.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => {
            if (prev.length >= 5) return prev;
            return [...prev, event.target!.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Video Upload (Optional)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showToast('Video size exceeds 25MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setVideoData({
          url: event.target.result as string,
          name: file.name,
        });
        showToast('Short proof video attached');
      }
    };
    reader.readAsDataURL(file);

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = () => {
    setVideoData(null);
  };

  // Submit Real Claim
  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isDelivered) {
      showToast('Damage claims can only be filed once the package is delivered.');
      return;
    }

    // Check 1-hour constraint strictly
    if (windowInfo.isExpired) {
      showToast('Damage claims must be reported within 1 hour of delivery.');
      return;
    }

    if (photos.length === 0) {
      showToast('Please upload at least 1 clear photo of product & packaging.');
      return;
    }

    if (!description.trim()) {
      showToast('Please provide a brief description of the issue.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const selectedItem =
        order.items.find((item) => item.id === selectedProductId) || order.items[0];

      const newClaim: DamageClaim = {
        id: generateClaimId(),
        orderId: order.id,
        productId: selectedItem?.id,
        productName: selectedItem?.name,
        productImage: selectedItem?.image,
        createdAt: Date.now(),
        reason: selectedReason,
        description: description.trim(),
        photos: [...photos],
        video: videoData?.url,
        videoName: videoData?.name,
        preferredResolution: preferredResolution,
        status: 'Pending Review',
        adminNotes: 'Claim received. Awaiting photo/packaging verification.',
      };

      const updatedOrder: Order = {
        ...order,
        damageClaim: newClaim,
      };

      onUpdateOrder(updatedOrder);
      setIsSubmitting(false);
      showToast('Your claim has been submitted and is pending review.');
    }, 600);
  };

  // Admin Status Update
  const handleSaveAdminReview = () => {
    if (!order.damageClaim) return;

    const updatedClaim: DamageClaim = {
      ...order.damageClaim,
      status: adminStatus,
      adminNotes: adminNotes.trim(),
      updatedAt: Date.now(),
      reviewedAt: Date.now(),
    };

    const updatedOrder: Order = {
      ...order,
      damageClaim: updatedClaim,
    };

    onUpdateOrder(updatedOrder);
    showToast(`Claim status updated to "${adminStatus}"`);
  };

  if (!isOpen) return null;

  const existingClaim = order.damageClaim;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#001f3f] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#FF8C00]" />
              <div>
                <h3 className="font-bold text-sm leading-tight">
                  {existingClaim ? 'Damage Claim Status' : 'Report Issue / Damage'}
                </h3>
                <p className="text-[10px] text-gray-300">
                  Order #{order.id} • {order.items.length} item{order.items.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">
            {/* Countdown / Window Banner */}
            {!isDelivered ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold block">Delivery in Progress</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Damage and issue claims can only be filed within 1 hour after package delivery is completed.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  windowInfo.isExpired
                    ? 'bg-rose-50 border-rose-200'
                    : windowInfo.minutes < 15
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock
                      className={`w-4 h-4 ${
                        windowInfo.isExpired
                          ? 'text-rose-600'
                          : windowInfo.minutes < 15
                          ? 'text-orange-600 animate-pulse'
                          : 'text-[#001f3f]'
                      }`}
                    />
                    <span className="text-xs font-bold text-[#001f3f]">
                      1-Hour Claim Window
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                      windowInfo.isExpired
                        ? 'bg-rose-600 text-white'
                        : windowInfo.minutes < 15
                        ? 'bg-[#FF8C00] text-white'
                        : 'bg-[#001f3f] text-white'
                    }`}
                  >
                    {windowInfo.isExpired
                      ? 'Expired'
                      : `${String(windowInfo.minutes).padStart(2, '0')}:${String(
                          windowInfo.seconds
                        ).padStart(2, '0')}`}
                  </span>
                </div>

                <div className="mt-2 text-xs flex flex-col gap-0.5 text-gray-600">
                  <div>
                    <span className="text-gray-400">Delivered At:</span>{' '}
                    <span className="font-semibold text-gray-800">
                      {windowInfo.formattedDeliveryTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Remaining Time:</span>{' '}
                    <span
                      className={`font-bold ${
                        windowInfo.isExpired ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {windowInfo.formattedRemaining}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 mt-2 pt-2 border-t border-gray-200/60 leading-relaxed">
                  {windowInfo.isExpired
                    ? 'The 60-minute post-delivery claim window has elapsed. Transit damages must be reported promptly upon delivery with packaging proof.'
                    : 'Report physical defects, cracks, or wrong items with photo/packaging proof before the 1-hour window expires.'}
                </p>
              </div>
            )}

            {/* ADMIN VERIFICATION DESK */}
            {isAdminMode && existingClaim && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#FF8C00]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      Order Management Desk
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Claim ID: {existingClaim.id}</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                    Update Claim Status:
                  </label>
                  <select
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value as ClaimStatus)}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#FF8C00]"
                  >
                    {CLAIM_STATUSES.map((st) => (
                      <option key={st} value={st} className="bg-slate-900">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                    Review Notes / Action Taken:
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter dispatch notes or resolution details..."
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#FF8C00]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveAdminReview}
                  className="w-full py-2 bg-[#FF8C00] hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
                >
                  Save Status Update
                </button>
              </div>
            )}

            {/* IF CLAIM ALREADY EXISTS: DISPLAY STATUS & EVIDENCE */}
            {existingClaim ? (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block">
                        Claim Tracking ID
                      </span>
                      <span className="text-sm font-black text-[#001f3f]">
                        {existingClaim.id}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block">
                        Current Status
                      </span>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                          existingClaim.status === 'Approved – Replacement'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : existingClaim.status === 'Approved – Refund'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : existingClaim.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : existingClaim.status === 'Completed'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {existingClaim.status}
                      </span>
                    </div>
                  </div>

                  {existingClaim.productName && (
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                      {existingClaim.productImage && (
                        <img
                          src={existingClaim.productImage}
                          alt={existingClaim.productName}
                          className="w-10 h-10 object-contain rounded-lg border border-gray-100 bg-gray-50"
                        />
                      )}
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">
                          Claimed Product
                        </span>
                        <span className="text-xs font-bold text-[#001f3f] line-clamp-1">
                          {existingClaim.productName}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] block">Reported Issue:</span>
                      <span className="font-bold text-gray-800">{existingClaim.reason}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">Preferred Resolution:</span>
                      <span className="font-bold text-[#FF8C00]">
                        {existingClaim.preferredResolution}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-400 text-[10px] block">Description:</span>
                    <p className="text-xs text-gray-700 mt-0.5 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      &ldquo;{existingClaim.description}&rdquo;
                    </p>
                  </div>

                  {existingClaim.adminNotes && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-400 text-[10px] block">Desk Review Notes:</span>
                      <p className="text-xs font-semibold text-emerald-800 mt-0.5 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                        {existingClaim.adminNotes}
                      </p>
                    </div>
                  )}

                  <div className="text-[10px] text-gray-400 text-right pt-1">
                    Submitted on{' '}
                    {new Date(existingClaim.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Attached Proof Photos */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
                  <span className="font-bold text-xs text-[#001f3f] block">
                    Attached Photographic Proof ({existingClaim.photos.length})
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {existingClaim.photos.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(img)}
                        className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer group hover:border-[#FF8C00] transition-colors"
                      >
                        <img
                          src={img}
                          alt={`Proof ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Video Evidence if attached */}
                  {existingClaim.video && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                      <span className="font-bold text-xs text-[#001f3f] block">
                        Uploaded Video Proof
                      </span>
                      <video
                        src={existingClaim.video}
                        controls
                        className="w-full rounded-xl max-h-48 bg-black"
                      />
                    </div>
                  )}
                </div>

                {/* Desk Switch */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAdminMode(!isAdminMode)}
                    className="text-[11px] font-bold text-gray-500 hover:text-[#001f3f] underline cursor-pointer"
                  >
                    {isAdminMode ? 'Hide Management Desk' : 'Open Claim Management Desk'}
                  </button>
                </div>
              </div>
            ) : (
              /* IF NO CLAIM YET: REPORT FORM */
              <form onSubmit={handleSubmitClaim} className="space-y-4">
                {/* Step 1: Select Damaged Product */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2.5">
                  <label className="font-bold text-xs text-[#001f3f] block">
                    1. Select Affected Product <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                          selectedProductId === item.id
                            ? 'border-[#FF8C00] bg-orange-50/40 text-[#001f3f] font-bold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-contain rounded-lg border border-gray-100 bg-gray-50"
                          />
                          <div>
                            <span className="text-xs block leading-tight">{item.name}</span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              Qty: {item.quantity} • ₹{item.price}
                            </span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="claimProduct"
                          value={item.id}
                          checked={selectedProductId === item.id}
                          onChange={() => setSelectedProductId(item.id)}
                          className="w-4 h-4 text-[#FF8C00] focus:ring-[#FF8C00]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step 2: Select Issue Reason */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2.5">
                  <label className="font-bold text-xs text-[#001f3f] block">
                    2. Select Issue Reason <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {CLAIM_REASONS.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                          selectedReason === reason
                            ? 'border-[#FF8C00] bg-orange-50/50 text-[#001f3f] font-bold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <span className="text-xs">{reason}</span>
                        <input
                          type="radio"
                          name="claimReason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={() => setSelectedReason(reason)}
                          className="w-4 h-4 text-[#FF8C00] focus:ring-[#FF8C00]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step 3: Preferred Resolution */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2.5">
                  <label className="font-bold text-xs text-[#001f3f] block">
                    3. Preferred Resolution <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreferredResolution('Replacement preferred')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        preferredResolution === 'Replacement preferred'
                          ? 'border-[#FF8C00] bg-orange-50 text-[#001f3f]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      Replacement
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredResolution('Refund requested')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        preferredResolution === 'Refund requested'
                          ? 'border-[#FF8C00] bg-orange-50 text-[#001f3f]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      Refund
                    </button>
                  </div>
                </div>

                {/* Step 4: Photo & Video Upload */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold text-xs text-[#001f3f] block">
                        4. Upload Photo Evidence <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-gray-500">
                        Upload clear photos of product &amp; packaging ({photos.length}/5)
                      </span>
                    </div>

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />

                    {photos.length < 5 && (
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="px-2.5 py-1.5 bg-[#001f3f] hover:bg-[#FF8C00] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Add Photos</span>
                      </button>
                    )}
                  </div>

                  {photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group"
                        >
                          <img
                            src={photo}
                            alt={`Upload ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow cursor-pointer hover:bg-rose-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {photos.length < 5 && (
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-[#FF8C00] flex flex-col items-center justify-center text-gray-400 hover:text-[#FF8C00] cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mb-1" />
                          <span className="text-[10px] font-semibold">+ Add</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-gray-200 hover:border-[#FF8C00] rounded-xl text-center cursor-pointer transition-colors bg-gray-50/50"
                    >
                      <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="font-bold text-xs text-[#001f3f]">
                        Tap to take or choose photo proof
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        PNG, JPG, WEBP accepted (up to 5 photos)
                      </p>
                    </div>
                  )}

                  {/* Optional Video Upload */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <label className="font-bold text-[11px] text-[#001f3f] block">
                        Short Video Proof <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <span className="text-[10px] text-gray-400">Max 25MB</span>
                    </div>

                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />

                    {!videoData && (
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="px-2.5 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-[#FF8C00]" />
                        <span>Attach Video</span>
                      </button>
                    )}
                  </div>

                  {videoData && (
                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#001f3f] truncate">
                          🎬 {videoData.name}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <video
                        src={videoData.url}
                        controls
                        className="w-full rounded-lg max-h-36 bg-black"
                      />
                    </div>
                  )}
                </div>

                {/* Step 5: Description */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
                  <label className="font-bold text-xs text-[#001f3f] block">
                    5. Describe the Issue <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about what is damaged, cracked, missing or broken..."
                    className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#001f3f]"
                  />
                </div>

                {/* Submission Action */}
                <div className="pt-1 space-y-2">
                  {windowInfo.isExpired ? (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-1">
                      <p className="font-extrabold text-rose-800 text-xs">
                        Damage claims must be reported within 1 hour of delivery.
                      </p>
                      <p className="text-[10px] text-rose-600">
                        Submission has been disabled because the 1-hour window for Order #{order.id} has expired.
                      </p>
                    </div>
                  ) : !isDelivered ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-1">
                      <p className="font-extrabold text-amber-800 text-xs">
                        Order is currently in transit.
                      </p>
                      <p className="text-[10px] text-amber-700">
                        Damage claims will unlock upon completed package delivery.
                      </p>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={
                      !isDelivered ||
                      windowInfo.isExpired ||
                      photos.length === 0 ||
                      !description.trim() ||
                      isSubmitting
                    }
                    className={`w-full py-3 text-white font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                      !isDelivered || windowInfo.isExpired || photos.length === 0 || !description.trim()
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                        : 'bg-[#FF8C00] hover:bg-orange-600 active:bg-orange-700 cursor-pointer'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Claim...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        <span>Submit Damage Claim</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>

        {/* Full Image Lightbox */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-lg max-h-[85vh]">
              <img
                src={lightboxImage}
                alt="Damage Proof Enlarge"
                className="max-w-full max-h-[85vh] rounded-xl object-contain"
              />
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
