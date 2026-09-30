import { ProductItem } from '../../types';

export const screenProtectorImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="16" fill="%23f8fafc"/><rect x="36" y="18" width="48" height="84" rx="8" fill="%23001f3f"/><rect x="32" y="16" width="52" height="84" rx="8" fill="%23ffffff" fill-opacity="0.85" stroke="%23FF8C00" stroke-width="2"/><path d="M40 80L80 36" stroke="%2338bdf8" stroke-width="3" stroke-linecap="round"/><circle cx="70" cy="74" r="12" fill="%23FF8C00"/><text x="70" y="78" text-anchor="middle" fill="%23ffffff" font-size="9" font-weight="bold" font-family="sans-serif">9H</text></svg>`;

export const SCREEN_PROTECTOR_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-screen-1',
    name: '9H Edge-to-Edge Tempered Glass Screen Protector',
    price: 149,
    originalPrice: 299,
    discountPercent: 50,
    image: screenProtectorImg,
    category: 'screen-protectors',
    inStock: true,
    createdAt: '2026-09-16T18:00:00Z',
    isNewArrival: true,
    description:
      'High-clarity 9H tempered glass with oleophobic anti-fingerprint coating and bubble-free silicone adhesive installation.',
    specifications: {
      'Hardness': '9H Scratch-Proof Diamond Glass',
      'Coating': 'Oleophobic Electroplated Anti-Smudge',
      'Thickness': '0.33mm Ultra-Thin',
    },
    warranty: 'Immediate Replacement upon transit damage.',
  },
];
