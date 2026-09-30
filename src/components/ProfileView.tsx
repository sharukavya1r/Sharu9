import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Banknote,
  Truck,
  Headphones,
  User,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Clock,
  Check,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Instagram,
  Facebook,
  Send,
  Share2,
  Download,
} from 'lucide-react';
import { SavedAddress, UserProfile } from '../types';
import { getStandardDeliveryFee, calculateDeliveryFee } from '../utils/delivery';
import { lookupPinCode } from '../utils/pincode';
import { SUPPORT_CONFIG } from '../config/support';

interface ProfileViewProps {
  onBackToShopping: () => void;
  showToast: (msg: string) => void;
  onNavigateToTab?: (tab: 'Home' | 'Categories' | 'Search' | 'Orders' | 'Profile') => void;
  addresses?: SavedAddress[];
  onUpdateAddresses?: (addresses: SavedAddress[]) => void;
  isCodSelected?: boolean;
  onToggleCod?: (selected: boolean) => void;
  isLoggedIn?: boolean;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  currentUser?: UserProfile | null;
  onUpdateProfile?: (user: UserProfile) => void;
}

type SubScreen = 'main' | 'addresses' | 'cod' | 'delivery' | 'support' | 'profile';

const INITIAL_FORM: Omit<SavedAddress, 'id'> = {
  fullName: '',
  mobile: '',
  building: '',
  street: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  phone: '',
  email: '',
  city: '',
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  onBackToShopping,
  showToast,
  onNavigateToTab,
  addresses: propAddresses,
  onUpdateAddresses,
  isCodSelected: propIsCodSelected,
  onToggleCod: propOnToggleCod,
  isLoggedIn = false,
  onOpenLogin,
  onLogout,
  currentUser,
  onUpdateProfile,
}) => {
  const [currentScreen, setCurrentScreen] = useState<SubScreen>('main');

  // --- User Profile State ---
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (currentUser) return currentUser;
    try {
      const stored = localStorage.getItem('quke_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && (parsed.name || parsed.phone || parsed.email)) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    if (currentUser) {
      setProfile(currentUser);
    } else if (!isLoggedIn) {
      setProfile(DEFAULT_PROFILE);
    }
  }, [currentUser, isLoggedIn]);

  const [profileForm, setProfileForm] = useState<UserProfile>(profile);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Sync profile form when opening profile edit
  const handleOpenProfileEdit = () => {
    if (!isLoggedIn) {
      onOpenLogin?.();
      return;
    }
    setProfileForm(profile);
    setProfileErrors({});
    setCurrentScreen('profile');
  };

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};
    if (!profileForm.name.trim()) errors.name = 'Full Name is required';
    if (!profileForm.phone.trim()) {
      errors.phone = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(profileForm.phone.trim().replace(/\D/g, ''))) {
      errors.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!profileForm.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
      errors.email = 'Enter a valid email address';
    }
    if (!profileForm.city.trim()) errors.city = 'City / Location is required';
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) {
      showToast('Please fix the errors in the profile form');
      return;
    }
    const updated: UserProfile = {
      id: profile.id || `usr_${Date.now()}`,
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      email: profileForm.email.trim(),
      city: profileForm.city.trim(),
    };
    setProfile(updated);
    try {
      localStorage.setItem('quke_user_profile', JSON.stringify(updated));
      localStorage.setItem('quke_user_session', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    onUpdateProfile?.(updated);
    showToast('Profile updated successfully');
    setCurrentScreen('main');
  };

  // --- Saved Addresses State (Option 1: Address) ---
  const [internalAddresses, setInternalAddresses] = useState<SavedAddress[]>(() => {
    try {
      const stored = localStorage.getItem('quke_saved_addresses');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const addresses = propAddresses || internalAddresses;

  const updateAddressesList = (newAddrs: SavedAddress[]) => {
    setInternalAddresses(newAddrs);
    try {
      localStorage.setItem('quke_saved_addresses', JSON.stringify(newAddrs));
      const def = newAddrs.find((a) => a.isDefault);
      if (def) {
        localStorage.setItem('quke_default_address_id', def.id);
      }
    } catch (e) {
      console.error(e);
    }
    if (onUpdateAddresses) {
      onUpdateAddresses(newAddrs);
    }
  };

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<SavedAddress, 'id'>>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- Cash on Delivery State (Option 2: Cash on Delivery) ---
  const [internalCodSelected, setInternalCodSelected] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('quke_cod_selected');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const isCodSelected = propIsCodSelected !== undefined ? propIsCodSelected : internalCodSelected;

  const handleToggleCod = (selected: boolean) => {
    setInternalCodSelected(selected);
    try {
      localStorage.setItem('quke_cod_selected', JSON.stringify(selected));
    } catch (e) {
      console.error(e);
    }
    if (propOnToggleCod) {
      propOnToggleCod(selected);
    }
    showToast(selected ? 'Cash on Delivery selected as payment method' : 'Cash on Delivery unselected');
  };

  // --- Delivery PIN Code Check State (Option 3: Delivery) ---
  const [pinCodeInput, setPinCodeInput] = useState('');
  const [pinStatus, setPinStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    postOffice?: string;
    state?: string;
    fee?: number;
    zone?: string;
    distance?: string;
  }>({ type: null, message: '' });

  const handleCheckPinCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinCodeInput.trim().replace(/\D/g, '');
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setPinStatus({
        type: 'error',
        message: 'Please enter a valid Indian PIN code.',
      });
      return;
    }

    const lookup = await lookupPinCode(cleanPin);
    if (lookup.success) {
      const calc = getStandardDeliveryFee({
        id: 'temp',
        fullName: '',
        mobile: '',
        building: '',
        street: '',
        city: lookup.district || lookup.postOfficeName || '',
        state: lookup.state,
        pincode: cleanPin,
        isDefault: false,
      });
      const poName = lookup.postOfficeName || lookup.district || 'Postal Hub';
      setPinStatus({
        type: 'success',
        message: 'PIN Code Verified',
        postOffice: poName,
        state: lookup.state,
        fee: calc.fee,
        zone: calc.zone,
        distance: calc.distanceDescription,
      });
      showToast(`PIN ${cleanPin} (${poName}, ${lookup.state}): Rate Checked`);
    } else {
      setPinStatus({
        type: 'error',
        message: 'Please enter a valid Indian PIN code.',
      });
    }
  };

  // --- Refer QukeBasket Handler ---
  const handleReferQukeBasket = async () => {
    const realAppUrl =
      import.meta.env.VITE_APP_URL ||
      (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '');

    const shareData = {
      title: 'QukeBasket - Authentic Mobile Accessories',
      text: 'Shop genuine mobile accessories at unbeatable prices on QukeBasket with 6-month replacement warranty and Cash on Delivery! Check it out here: ',
      url: realAppUrl,
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
      await navigator.clipboard.writeText(`Shop authentic mobile accessories on QukeBasket: ${realAppUrl}`);
      showToast('Referral link copied to clipboard!');
    } catch {
      showToast('Unable to copy referral link.');
    }
  };

  // --- Download APK Handler ---
  const handleDownloadApk = () => {
    const apkUrl = import.meta.env.VITE_APK_DOWNLOAD_URL?.trim();
    if (apkUrl && apkUrl.startsWith('http')) {
      window.open(apkUrl, '_blank');
    } else {
      showToast('VITE_APK_DOWNLOAD_URL is a required configuration value.');
    }
  };

  // Selected or default address for delivery section
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;
  const deliveryCalc = calculateDeliveryFee(defaultAddress, 0);

  // --- FAQ Accordion State for Support (Option 4: Support) ---
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const FAQS = [
    {
      q: 'How do I track my order?',
      a: 'Tap the "Orders" tab in the bottom bar to view live order progress, dispatch status, courier details, and estimated delivery time.',
    },
    {
      q: 'How does Cash on Delivery (COD) work?',
      a: 'You can pay the exact invoice amount in cash or scan the courier executive’s UPI QR code directly at your doorstep with ₹0 extra collection fee.',
    },
    {
      q: 'What is the 1-Hour Damage Claim Guarantee?',
      a: 'If any accessory arrives damaged, broken, or defective, report it within 1 hour of delivery with photos in the Orders tab for immediate doorstep replacement dispatch.',
    },
    {
      q: 'Are all products 100% authentic with warranty?',
      a: 'Yes, every accessory sold on QukeBasket is sourced directly from certified brand distributors with manufacturer warranty coverage.',
    },
  ];

  // --- Address Handlers ---
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setFormData({
      ...INITIAL_FORM,
      isDefault: addresses.length === 0,
    });
    setFormErrors({});
    setIsEditingAddress(true);
  };

  const handleOpenEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setFormData({
      fullName: addr.fullName,
      mobile: addr.mobile,
      building: addr.building,
      street: addr.street,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: !!addr.isDefault,
    });
    setFormErrors({});
    setIsEditingAddress(true);
  };

  const handleCancelAddressForm = () => {
    setIsEditingAddress(false);
    setEditingAddressId(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
  };

  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile Number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim().replace(/\D/g, ''))) {
      errors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.building.trim()) errors.building = 'House/Flat/Building is required';
    if (!formData.street.trim()) errors.street = 'Street/Area is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pincode.trim()) {
      errors.pincode = 'PIN Code is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      errors.pincode = 'Enter a valid 6-digit PIN code';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddressForm()) {
      showToast('Please fix the errors in the address form');
      return;
    }

    if (editingAddressId) {
      let updated = addresses.map((addr) =>
        addr.id === editingAddressId
          ? { ...formData, id: editingAddressId }
          : addr
      );
      if (formData.isDefault) {
        updated = updated.map((a) => ({
          ...a,
          isDefault: a.id === editingAddressId,
        }));
      }
      updateAddressesList(updated);
      showToast('Address updated successfully');
    } else {
      const newId = `addr-${Date.now()}`;
      const newAddress: SavedAddress = {
        ...formData,
        id: newId,
        isDefault: formData.isDefault || addresses.length === 0,
      };
      let updated: SavedAddress[];
      if (newAddress.isDefault) {
        updated = [newAddress, ...addresses.map((a) => ({ ...a, isDefault: false }))];
      } else {
        updated = [newAddress, ...addresses];
      }
      updateAddressesList(updated);
      showToast('New address saved successfully');
    }

    setIsEditingAddress(false);
    setEditingAddressId(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
  };

  const [availablePostOffices, setAvailablePostOffices] = useState<string[]>([]);

  const handleAddressPincodeChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: clean }));
    setAvailablePostOffices([]);
    if (clean.length === 6) {
      const res = await lookupPinCode(clean);
      if (res.success) {
        const poNames = res.postOffices.map((po) => po.name);
        setAvailablePostOffices(poNames);
        setFormData((prev) => ({
          ...prev,
          city: res.district,
          state: res.state,
          street: poNames.length > 0 ? poNames[0] : prev.street,
        }));
        showToast(`PIN ${clean}: ${res.district}, ${res.state} verified`);
      }
    }
  };
  const handleDeleteAddress = (id: string) => {
    const remaining = addresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    updateAddressesList(remaining);
    setDeletingId(null);
    showToast('Address deleted');
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    updateAddressesList(updated);
    showToast('Default delivery address updated');
  };

  // =============================================================
  // SUB-SCREEN 1: Saved Addresses (Add, Edit, Delete, Set Default)
  // =============================================================
  if (currentScreen === 'addresses') {
    return (
      <div className="p-4 space-y-4">
        {/* Sub-screen header with back navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-back-to-profile-main"
              onClick={() => {
                if (isEditingAddress) {
                  setIsEditingAddress(false);
                } else {
                  setCurrentScreen('main');
                }
              }}
              className="p-1.5 -ml-1 text-gray-600 hover:text-gray-900 rounded-full cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-[#001f3f]">
              {isEditingAddress
                ? editingAddressId
                  ? 'Edit Address'
                  : 'Add New Address'
                : 'Saved Addresses'}
            </h2>
          </div>
          {!isEditingAddress && (
            <button
              type="button"
              id="btn-add-new-address"
              onClick={handleOpenAddAddress}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#001f3f] hover:bg-[#FF8C00] px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          )}
        </div>

        {/* Form View (Add / Edit) */}
        {isEditingAddress ? (
          <form onSubmit={handleSaveAddress} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter full name"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f]"
              />
              {formErrors.fullName && (
                <p className="text-[10px] text-red-500 mt-0.5">{formErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                maxLength={10}
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                placeholder="10-digit mobile number"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f]"
              />
              {formErrors.mobile && (
                <p className="text-[10px] text-red-500 mt-0.5">{formErrors.mobile}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                House / Flat / Building *
              </label>
              <input
                type="text"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="Flat 402, Sunshine Heights"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f]"
              />
              {formErrors.building && (
                <p className="text-[10px] text-red-500 mt-0.5">{formErrors.building}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Street / Area *
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Street name, Area, Colony"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f]"
              />
              {formErrors.street && (
                <p className="text-[10px] text-red-500 mt-0.5">{formErrors.street}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={formData.landmark || ''}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="Near Metro Station"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f]"
                />
                {formErrors.city && (
                  <p className="text-[10px] text-red-500 mt-0.5">{formErrors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Karnataka"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f]"
                />
                {formErrors.state && (
                  <p className="text-[10px] text-red-500 mt-0.5">{formErrors.state}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => handleAddressPincodeChange(e.target.value)}
                placeholder="6-digit PIN code"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f]"
              />
              {formErrors.pincode && (
                <p className="text-[10px] text-red-500 mt-0.5">{formErrors.pincode}</p>
              )}
            </div>

            {availablePostOffices.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Select Post Office / Area *
                </label>
                <select
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#001f3f]"
                >
                  {availablePostOffices.map((po) => (
                    <option key={po} value={po}>
                      {po}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-[#001f3f] rounded border-gray-300 focus:ring-[#001f3f]"
                />
                <span className="text-xs font-semibold text-gray-700">
                  Set as default delivery address
                </span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelAddressForm}
                className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-bold text-white bg-[#001f3f] hover:bg-[#FF8C00] rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {editingAddressId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        ) : (
          /* Address List */
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-gray-100 text-center shadow-sm">
                <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">No saved addresses</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Add an address for quick and accurate delivery checkout.
                </p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white rounded-xl p-4 border transition-all ${
                    addr.isDefault
                      ? 'border-orange-300 shadow-sm bg-orange-50/20'
                      : 'border-gray-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#001f3f]">
                          {addr.fullName}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold bg-[#FF8C00] text-white px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        📞 +91 {addr.mobile}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAddress(addr)}
                        className="p-1.5 text-gray-500 hover:text-[#001f3f] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        title="Edit Address"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(addr.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {addr.building}, {addr.street}
                    {addr.landmark ? `, ${addr.landmark}` : ''}
                    <br />
                    {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                  </p>

                  {!addr.isDefault && (
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-[11px] font-bold text-[#001f3f] hover:text-[#FF8C00] flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Set as Default</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-3">
              <h3 className="text-sm font-bold text-[#001f3f]">Delete Address?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to remove this delivery address from your saved addresses?
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(deletingId)}
                  className="flex-1 py-2 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =============================================================
  // SUB-SCREEN 2: Cash on Delivery (COD Settings & Selection)
  // =============================================================
  if (currentScreen === 'cod') {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentScreen('main')}
            className="p-1.5 -ml-1 text-gray-600 hover:text-gray-900 rounded-full cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-[#001f3f]">Cash on Delivery</h2>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF8C00] flex items-center justify-center shrink-0 mt-0.5">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#001f3f]">
                  Cash on Delivery (COD)
                </h3>
                {isCodSelected && (
                  <span className="text-[10px] font-bold text-[#FF8C00] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Pay with cash or scan courier UPI QR at doorstep. No advance digital payment or card details required.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-[11px] text-gray-600 space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Available across 19,000+ PIN codes in India</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Zero payment convenience fee on orders above ₹299</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Doorstep UPI QR scan supported by all delivery executives</span>
            </div>
          </div>

          {/* Interactive Toggle Button */}
          <div className="pt-2">
            <button
              type="button"
              id="btn-toggle-cod-selection"
              onClick={() => handleToggleCod(!isCodSelected)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                isCodSelected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-[#FF8C00] text-white hover:bg-orange-600'
              }`}
            >
              {isCodSelected ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Selected as Preferred Payment (Tap to Toggle)</span>
                </>
              ) : (
                <span>Select Cash on Delivery</span>
              )}
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setCurrentScreen('main')}
            className="text-xs font-bold text-[#FF8C00] hover:underline cursor-pointer"
          >
            ← Back to My Account
          </button>
        </div>
      </div>
    );
  }

  // =============================================================
  // SUB-SCREEN 3: Delivery (Check delivery rate by PIN code)
  // =============================================================
  if (currentScreen === 'delivery') {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentScreen('main')}
            className="p-1.5 -ml-1 text-gray-600 hover:text-gray-900 rounded-full cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-[#001f3f]">Delivery Information</h2>
        </div>

        {/* Selected / Default Delivery Address (Overview only) */}
        {defaultAddress && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF8C00]" />
                <h3 className="text-xs font-bold text-[#001f3f]">
                  Selected Delivery Address
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrentScreen('addresses')}
                className="text-[11px] font-bold text-[#FF8C00] hover:underline cursor-pointer"
              >
                Change Address
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[#001f3f]">{defaultAddress.fullName}</span>
                <span className="text-[10px] font-bold bg-[#FF8C00] text-white px-2 py-0.2 rounded-full">
                  Default
                </span>
                <span className="text-[11px] text-gray-500">📞 +91 {defaultAddress.mobile}</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-[11px]">
                {defaultAddress.building}, {defaultAddress.street}
                {defaultAddress.landmark ? `, ${defaultAddress.landmark}` : ''}
                <br />
                {defaultAddress.city}, {defaultAddress.state} - <span className="font-bold">{defaultAddress.pincode}</span>
              </p>
            </div>
          </div>
        )}

        {/* Check delivery rate by PIN code */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-[#FF8C00]" />
            <h3 className="text-xs font-bold text-[#001f3f]">
              Check delivery rate by PIN code
            </h3>
          </div>

          <form onSubmit={handleCheckPinCode} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter 6-digit PIN Code"
              maxLength={6}
              value={pinCodeInput}
              onChange={(e) => {
                setPinCodeInput(e.target.value.replace(/\D/g, ''));
                if (pinStatus.type) setPinStatus({ type: null, message: '' });
              }}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f] focus:ring-1 focus:ring-[#001f3f]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#001f3f] hover:bg-[#FF8C00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              Check Rate
            </button>
          </form>

          {/* Validation Result Box */}
          {pinStatus.type === 'success' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Serviceable Delivery Area</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Post Office / Area</span>
                  <span className="font-semibold text-[#001f3f]">{pinStatus.postOffice}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">State</span>
                  <span className="font-semibold text-[#001f3f]">{pinStatus.state}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60">
                <span className="text-gray-700 font-medium">Calculated Delivery Charge:</span>
                <span className="font-bold text-sm text-[#001f3f]">
                  ₹{pinStatus.fee}
                </span>
              </div>
              <div className="text-[10.5px] text-emerald-800 font-medium flex items-center justify-between">
                <span>Free Delivery Eligibility:</span>
                <span className="font-bold">₹299+ cart total = ₹0 (FREE)</span>
              </div>
            </div>
          )}

          {pinStatus.type === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="font-medium">Please enter a valid Indian PIN code.</p>
            </div>
          )}
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setCurrentScreen('main')}
            className="text-xs font-bold text-[#FF8C00] hover:underline cursor-pointer"
          >
            ← Back to My Account
          </button>
        </div>
      </div>
    );
  }

  // =============================================================
  // SUB-SCREEN 4: Help & Customer Support (Call, WhatsApp, Order Help)
  // =============================================================
  if (currentScreen === 'support') {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentScreen('main')}
            className="p-1.5 -ml-1 text-gray-600 hover:text-gray-900 rounded-full cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-[#001f3f]">
            Help &amp; Customer Support
          </h2>
        </div>

        {/* Support Options Card */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF8C00] flex items-center justify-center shrink-0 mt-0.5">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#001f3f]">
                24x7 Customer Support
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Immediate assistance regarding orders, transit tracking, replacement claims, or warranty help.
              </p>
            </div>
          </div>

          {/* Action Buttons: Toll-Free, WhatsApp, Order Help, Email, Instagram, Telegram, Facebook */}
          <div className="border-t border-gray-100 pt-3 space-y-2.5">
            {/* 1. Call Support */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 mr-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-[#001f3f] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#FF8C00]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                    Toll-Free Helpline
                  </span>
                  <span className="text-xs font-extrabold text-[#001f3f] block truncate">
                    {SUPPORT_CONFIG.tollFreeNumber}
                  </span>
                </div>
              </div>
              <a
                href={`tel:${SUPPORT_CONFIG.tollFreeTel}`}
                onClick={() => showToast(`Connecting to Toll-Free Support: ${SUPPORT_CONFIG.tollFreeNumber}`)}
                className="px-3 py-1.5 bg-[#001f3f] hover:bg-[#FF8C00] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Call Support
              </a>
            </div>

            {/* 2. WhatsApp Priority Chat */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 mr-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                    WhatsApp Chat
                  </span>
                  <span className="text-xs font-extrabold text-[#001f3f] block truncate">
                    Instant Support Desk
                  </span>
                </div>
              </div>
              <a
                href={SUPPORT_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => showToast('Opening WhatsApp Support Chat')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Contact Support
              </a>
            </div>

            {/* 3. Order Help */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 mr-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-[#001f3f] flex items-center justify-center shrink-0">
                  <PackageCheck className="w-4 h-4 text-[#FF8C00]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                    Your Orders
                  </span>
                  <span className="text-xs font-extrabold text-[#001f3f] block truncate">
                    Track &amp; Damage Claims
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToTab) {
                    onNavigateToTab('Orders');
                  }
                }}
                className="px-3 py-1.5 bg-[#FF8C00] hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Order Help
              </button>
            </div>

            {/* 4. Email Desk */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 mr-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-[#001f3f] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#FF8C00]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                    EMAIL DESK
                  </span>
                  <span className={`text-xs block truncate ${SUPPORT_CONFIG.supportEmail ? 'font-extrabold text-[#001f3f]' : 'font-medium text-gray-400'}`}>
                    {SUPPORT_CONFIG.supportEmail || 'Not configured'}
                  </span>
                </div>
              </div>
              {SUPPORT_CONFIG.supportEmail ? (
                <a
                  href={`mailto:${SUPPORT_CONFIG.supportEmail}?subject=QukeBasket%20Customer%20Support`}
                  onClick={() => showToast(`Opening Email to ${SUPPORT_CONFIG.supportEmail}`)}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-[#001f3f] text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Send Email
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => showToast('Email support is not configured yet.')}
                  className="px-3 py-1.5 bg-gray-200 text-gray-500 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Send Email
                </button>
              )}
            </div>

            {/* 5. Instagram */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 mr-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-pink-600 flex items-center justify-center shrink-0">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                    Instagram
                  </span>
                  <span className={`text-xs block truncate ${SUPPORT_CONFIG.instagramUrl ? 'font-extrabold text-[#001f3f]' : 'font-medium text-gray-400'}`}>
                    {SUPPORT_CONFIG.instagramUrl ? SUPPORT_CONFIG.instagramUrl.replace(/^https?:\/\/(www\.)?/, '') : 'Not configured'}
                  </span>
                </div>
              </div>
              {SUPPORT_CONFIG.instagramUrl ? (
                <a
                  href={SUPPORT_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#001f3f] hover:bg-[#FF8C00] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Open Instagram
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => showToast('Instagram link is not configured yet.')}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Open Instagram
                </button>
              )}
            </div>

            {/* 6. Telegram */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 mr-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-sky-500 flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                    Telegram
                  </span>
                  <span className={`text-xs block truncate ${SUPPORT_CONFIG.telegramUrl ? 'font-extrabold text-[#001f3f]' : 'font-medium text-gray-400'}`}>
                    {SUPPORT_CONFIG.telegramUrl ? SUPPORT_CONFIG.telegramUrl.replace(/^https?:\/\/(www\.)?/, '') : 'Not configured'}
                  </span>
                </div>
              </div>
              {SUPPORT_CONFIG.telegramUrl ? (
                <a
                  href={SUPPORT_CONFIG.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Chat on Telegram
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => showToast('Telegram link is not configured yet.')}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Chat on Telegram
                </button>
              )}
            </div>

            {/* 7. Facebook */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 mr-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-blue-600 flex items-center justify-center shrink-0">
                  <Facebook className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                    Facebook
                  </span>
                  <span className={`text-xs block truncate ${SUPPORT_CONFIG.facebookUrl ? 'font-extrabold text-[#001f3f]' : 'font-medium text-gray-400'}`}>
                    {SUPPORT_CONFIG.facebookUrl ? SUPPORT_CONFIG.facebookUrl.replace(/^https?:\/\/(www\.)?/, '') : 'Not configured'}
                  </span>
                </div>
              </div>
              {SUPPORT_CONFIG.facebookUrl ? (
                <a
                  href={SUPPORT_CONFIG.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Visit Facebook
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => showToast('Facebook link is not configured yet.')}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Visit Facebook
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Real Interactive FAQs */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-2.5">
          <h4 className="text-xs font-bold text-[#001f3f]">
            Frequently Asked Questions (FAQs)
          </h4>
          <div className="divide-y divide-gray-100">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="py-2.5 first:pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)
                  }
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-[#001f3f] hover:text-[#FF8C00] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {expandedFaqIndex === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#FF8C00] shrink-0 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
                  )}
                </button>
                {expandedFaqIndex === idx && (
                  <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setCurrentScreen('main')}
            className="text-xs font-bold text-[#FF8C00] hover:underline cursor-pointer"
          >
            ← Back to My Account
          </button>
        </div>
      </div>
    );
  }

  // =============================================================
  // SUB-SCREEN 5: Profile (View & Edit Profile Details)
  // =============================================================
  if (currentScreen === 'profile') {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentScreen('main')}
            className="p-1.5 -ml-1 text-gray-600 hover:text-gray-900 rounded-full cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-[#001f3f]">Profile Details</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3.5">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-[#001f3f] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'Q'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#001f3f]">
                {profileForm.name || 'Quke Shopper'}
              </h3>
              <p className="text-[11px] text-gray-400">Personal Information</p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Enter full name"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f]"
            />
            {profileErrors.name && (
              <p className="text-[10px] text-red-500 mt-0.5">{profileErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="10-digit mobile number"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f]"
            />
            {profileErrors.phone && (
              <p className="text-[10px] text-red-500 mt-0.5">{profileErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              placeholder="shopper@qukebasket.in"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f]"
            />
            {profileErrors.email && (
              <p className="text-[10px] text-red-500 mt-0.5">{profileErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              City / State *
            </label>
            <input
              type="text"
              value={profileForm.city}
              onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              placeholder="City, State"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#001f3f]"
            />
            {profileErrors.city && (
              <p className="text-[10px] text-red-500 mt-0.5">{profileErrors.city}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentScreen('main')}
              className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-bold text-white bg-[#001f3f] hover:bg-[#FF8C00] rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Save Profile
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setCurrentScreen('main')}
            className="text-xs font-bold text-[#FF8C00] hover:underline cursor-pointer"
          >
            ← Back to My Account
          </button>
        </div>
      </div>
    );
  }

  // =============================================================
  // MAIN SCREEN: EXACTLY 5 REQUESTED OPTIONS AND NOTHING ELSE
  // 1. Address
  // 2. Cash on Delivery
  // 3. Delivery
  // 4. Help & Customer Support
  // 5. Profile
  // =============================================================
  return (
    <div className="p-4 space-y-4">
      {/* Profile Card */}
      {!isLoggedIn ? (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#001f3f]">My Account</h3>
              <p className="text-xs text-gray-400">
                Log in to view orders &amp; addresses
              </p>
            </div>
          </div>
          <button
            type="button"
            id="profile-btn-login"
            onClick={onOpenLogin}
            className="text-xs font-bold bg-[#FF8C00] hover:bg-orange-600 text-white px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Login
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#001f3f] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#001f3f] truncate">
                {profile.name || 'My Profile'}
              </h3>
              <p className="text-xs text-gray-400 truncate">
                {profile.phone ? `+91 ${profile.phone}` : profile.email || 'Logged In'} {profile.city ? `• ${profile.city}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenProfileEdit}
              className="text-xs font-bold text-[#001f3f] hover:underline cursor-pointer"
            >
              Edit
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              id="profile-btn-logout"
              onClick={onLogout}
              className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Account Menu Options */}
      <div className="bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm divide-y divide-gray-100 text-xs font-medium text-[#001f3f]">
        {/* 1. Address */}
        <div
          id="profile-opt-address"
          onClick={() => setCurrentScreen('addresses')}
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF8C00] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#001f3f]">Address</span>
                {addresses.length > 0 && (
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                    {addresses.length} saved
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                Manage saved delivery addresses
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#001f3f] transition-colors" />
        </div>

        {/* 2. Cash on Delivery */}
        <div
          id="profile-opt-cod"
          onClick={() => setCurrentScreen('cod')}
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF8C00] flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#001f3f]">
                  Cash on Delivery
                </span>
                {isCodSelected && (
                  <span className="text-[10px] font-semibold text-[#FF8C00] bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded leading-none">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                Pay when your order arrives at doorstep
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#001f3f] transition-colors" />
        </div>

        {/* 3. Delivery */}
        <div
          id="profile-opt-delivery"
          onClick={() => setCurrentScreen('delivery')}
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF8C00] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#001f3f]">Delivery</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                  FREE ₹299+
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                Address delivery fee, ETA &amp; schedule
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#001f3f] transition-colors" />
        </div>

        {/* 4. Help & Customer Support */}
        <div
          id="profile-opt-help"
          onClick={() => setCurrentScreen('support')}
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF8C00] flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#001f3f]">
                Help &amp; Customer Support
              </span>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                Toll-free helpline, WhatsApp &amp; order help
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#001f3f] transition-colors" />
        </div>

        {/* 5. Refer QukeBasket */}
        <div
          id="profile-opt-refer"
          onClick={handleReferQukeBasket}
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF8C00] flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#001f3f]">
                Refer QukeBasket
              </span>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                Share store link with friends &amp; family
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#001f3f] transition-colors" />
        </div>

        {/* 6. Download APK */}
        <div
          id="profile-opt-apk"
          onClick={handleDownloadApk}
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF8C00] flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#001f3f]">
                Download APK
              </span>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                Install Android app for quick ordering
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#001f3f] transition-colors" />
        </div>
      </div>
    </div>
  );
};
