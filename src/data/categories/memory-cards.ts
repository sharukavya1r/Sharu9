import { ProductItem } from '../../types';

export const memoryCardImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="16" fill="%23f8fafc"/><path d="M36 28a6 6 0 0 1 6-6h36a6 6 0 0 1 6 6v64a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6V54l-4-4v-16l4-4v-2z" fill="%23001f3f"/><rect x="44" y="26" width="5" height="12" rx="1.5" fill="%23FF8C00"/><rect x="52" y="26" width="5" height="12" rx="1.5" fill="%23FF8C00"/><rect x="60" y="26" width="5" height="12" rx="1.5" fill="%23FF8C00"/><rect x="68" y="26" width="5" height="12" rx="1.5" fill="%23FF8C00"/><text x="60" y="62" text-anchor="middle" fill="%23ffffff" font-size="11" font-weight="bold" font-family="sans-serif">MicroSD</text><text x="60" y="78" text-anchor="middle" fill="%23FF8C00" font-size="14" font-weight="bold" font-family="sans-serif">64GB</text></svg>`;

export const MEMORY_CARD_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-memory-1',
    name: '64GB Class 10 High-Speed MicroSDXC Card',
    price: 449,
    originalPrice: 799,
    discountPercent: 44,
    image: memoryCardImg,
    category: 'memory-cards',
    inStock: true,
    createdAt: '2026-09-14T16:45:00Z',
    isNewArrival: true,
    description:
      'Up to 100MB/s read speeds, Class 10 U3 V30 speed specification suitable for Full HD and 4K video recording on smartphones, dash cams, and action cameras.',
    specifications: {
      'Capacity': '64GB',
      'Speed Class': 'Class 10, UHS-I (U3), V30',
      'Read Speed': 'Up to 100 MB/s',
    },
    warranty: '5 Years Limited Warranty.',
  },
];
