import { ProductItem } from '../../types';

export const carChargerImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="16" fill="%23f8fafc"/><path d="M46 30h28l4 28h8a4 4 0 0 1 4 4v22a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V62a4 4 0 0 1 4-4h8l4-28z" fill="%23001f3f"/><rect x="55" y="20" width="10" height="10" rx="2" fill="%23FF8C00"/><rect x="46" y="70" width="12" height="7" rx="2" fill="%23ffffff"/><rect x="62" y="70" width="12" height="7" rx="2" fill="%23ffffff"/><circle cx="60" cy="85" r="2.5" fill="%23FF8C00"/></svg>`;

export const CAR_CHARGER_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-car-1',
    name: '36W Dual Fast Car Charger (PD + QC 3.0)',
    price: 349,
    originalPrice: 699,
    discountPercent: 50,
    image: carChargerImg,
    category: 'car-chargers',
    inStock: true,
    createdAt: '2026-09-10T11:20:00Z',
    isNewArrival: false,
    description:
      'Heavy-duty aluminum alloy car cigarette socket adapter with dual simultaneous high-speed charging outputs and subtle blue ring LED.',
    specifications: {
      'Total Output': '36W Turbo Charge',
      'Ports': '1x USB-C PD 20W + 1x USB-A QC 18W',
      'Material': 'Full Metal Aluminum Housing',
    },
    warranty: '1 Year Warranty.',
  },
];
