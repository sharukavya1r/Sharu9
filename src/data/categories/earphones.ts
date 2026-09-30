import earphonesImg from '../../assets/images/wired_earphones_1788669538273.jpg';
import { ProductItem } from '../../types';

export const EARPHONE_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-earphones-1',
    name: 'HD Deep Bass Wired In-Ear Earphones with Mic',
    price: 99,
    originalPrice: 300,
    discountPercent: 67,
    image: 'https://i.ibb.co/yFhw6r9G/81-QGR4-I0x-QL-AC-UF1000-1000-QL80-FMwebp.webp',
    images: [
      'https://i.ibb.co/yFhw6r9G/81-QGR4-I0x-QL-AC-UF1000-1000-QL80-FMwebp.webp',
      'https://i.ibb.co/rKcSBSK6/81e-Gk3-RCJn-L-AC-UF1000-1000-QL80-FMwebp.webp',
      'https://i.ibb.co/Fk9XGz65/71-Lp839-JBYL-AC-UF1000-1000-QL80-FMwebp.webp',
      'https://i.ibb.co/nNr7PfBg/61uke-Mawpl-L-AC-UF1000-1000-QL80-FMwebp.webp',
    ],
    category: 'earphones',
    inStock: true,
    createdAt: '2026-09-05T12:00:00Z',
    isNewArrival: false,
    description:
      '10mm dynamic acoustic drivers delivering rich punchy bass and clear vocals. Features tangle-free elastomeric cable, inline HD noise-isolation microphone, and 3.5mm gold-plated jack.',
    specifications: {
      'Driver Size': '10mm Dynamic Titanium Drivers',
      'Connector': '3.5mm Gold-Plated Jack',
      'Cable Length': '1.2m Durable TPE Wire',
      'Inline Remote': 'Single button playback & call mic',
    },
    warranty: '6 Months Replacement Warranty.',
  },
];
