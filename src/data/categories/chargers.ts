import chargerImg from '../../assets/images/charger_adapter_1788669515816.jpg';
import { ProductItem } from '../../types';

export const CHARGER_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-charger-1',
    name: '33W GaN Dual Port Super Fast Charger',
    price: 499,
    originalPrice: 999,
    discountPercent: 50,
    image: chargerImg,
    category: 'chargers',
    inStock: true,
    createdAt: '2026-09-15T14:30:00Z',
    isNewArrival: true,
    description:
      'Compact Gallium Nitride (GaN) 33W wall adapter with Dual Ports (Type-C PD + USB-A QuickCharge 3.0). Supports universal fast charging for smartphones, tablets, and lightweight ultrabooks.',
    specifications: {
      'Total Output': '33W Max',
      'Ports': '1x USB Type-C (PD 3.0), 1x USB-A (QC 3.0)',
      'Technology': 'GaN (Gallium Nitride) Heat-Safe',
      'Input Voltage': '100-240V AC 50/60Hz',
    },
    warranty: '1 Year Brand Replacement Warranty.',
  },
];
