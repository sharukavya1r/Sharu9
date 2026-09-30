import { ProductItem } from '../../types';

export const caseImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="16" fill="%23f8fafc"/><rect x="34" y="16" width="52" height="88" rx="10" fill="%23001f3f"/><rect x="40" y="24" width="40" height="72" rx="6" fill="%231e293b"/><rect x="42" y="26" width="18" height="20" rx="4" fill="%23FF8C00"/><circle cx="51" cy="36" r="4" fill="%23ffffff"/><circle cx="60" cy="60" r="14" stroke="%23FF8C00" stroke-width="2.5" stroke-dasharray="4 2"/></svg>`;

export const MOBILE_CASE_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-case-1',
    name: 'Shockproof MagSafe Transparent Armor Case',
    price: 279,
    originalPrice: 599,
    discountPercent: 53,
    image: caseImg,
    category: 'cases',
    inStock: true,
    createdAt: '2026-09-13T10:10:00Z',
    isNewArrival: false,
    description:
      'Anti-yellowing crystal clear polycarbonate back with impact-absorbing TPU air-cushioned corners and built-in N52 magnetic ring.',
    specifications: {
      'Protection': 'Military Grade 10ft Drop Protection',
      'Magnet': '38x Strong N52 Neodymium Ring',
      'Material': 'Bayer Anti-Yellowing German Polycarbonate',
    },
    warranty: '6 Months Replacement Warranty.',
  },
];
