import { ProductItem } from '../../types';

export const holderImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="16" fill="%23f8fafc"/><ellipse cx="60" cy="98" rx="34" ry="10" fill="%23001f3f"/><path d="M60 68v28" stroke="%23001f3f" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="64" r="8" fill="%23FF8C00"/><rect x="38" y="24" width="44" height="40" rx="6" fill="%23001f3f"/><rect x="44" y="28" width="32" height="32" rx="4" fill="%23ffffff"/><path d="M30 44h8M82 44h8" stroke="%23FF8C00" stroke-width="4" stroke-linecap="round"/></svg>`;

export const MOBILE_HOLDER_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-holder-1',
    name: 'Foldable Metal Smartphone & Tablet Desk Stand',
    price: 249,
    originalPrice: 499,
    discountPercent: 50,
    image: holderImg,
    category: 'holders',
    inStock: true,
    createdAt: '2026-09-08T08:00:00Z',
    isNewArrival: false,
    description:
      'Fully adjustable dual-hinge aluminum desktop stand with non-slip silicone pads and cable pass-through hole.',
    specifications: {
      'Material': 'Aerospace Aluminum Alloy',
      'Angle': '270° Dual-Axis Rotation',
      'Compatibility': '4.7" to 12.9" Phones & Tablets',
    },
    warranty: '6 Months Warranty.',
  },
];
