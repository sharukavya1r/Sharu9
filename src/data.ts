import heroAccessoriesImg from './data/hero/images/tech_hero_accessories_1788669483676.jpg';
import chargerImg from './assets/images/charger_adapter_1788669515816.jpg';

import { CategoryItem, ProductItem } from './types';

export const HERO_BANNER = {
  titleLine1: 'Upgrade Your',
  titleLine2: 'Tech Life',
  ctaText: 'Shop Now',
  image: heroAccessoriesImg,
};

export const CATEGORIES: CategoryItem[] = [
  { id: 'cables', name: 'Cables', icon: 'cable' },
  { id: 'chargers', name: 'Chargers', icon: 'charger' },
  { id: 'earphones', name: 'Earphones', icon: 'earphones' },
];

export const CABLE_PRODUCT_IMAGES: string[] = [
  'https://i.ibb.co/nNJ8wP5b/IMG-20260907-183147.jpg',
  'https://i.ibb.co/1fyHn1VW/IMG-20260907-183202.jpg',
  'https://i.ibb.co/DDyK07K1/IMG-20260907-183222.jpg',
  'https://i.ibb.co/670wCJ1L/IMG-20260907-183236.jpg',
  'https://i.ibb.co/zT50xpPv/IMG-20260907-183248.jpg',
  'https://i.ibb.co/yTN3Gj9/IMG-20260907-183311.jpg',
];

export const CABLE_DETAIL_IMAGES: string[] = [
  'https://i.ibb.co/hJYfzC5z/IMG-20260907-183515.jpg',
  'https://i.ibb.co/gLHJX0JQ/IMG-20260907-183502.jpg',
  'https://i.ibb.co/RGGF4LtX/IMG-20260907-183357.jpg',
  'https://i.ibb.co/JwYyq27L/IMG-20260907-183424.jpg',
  'https://i.ibb.co/LhHqbLCC/IMG-20260907-183341.jpg',
];

export const BEST_SELLING_PRODUCTS: ProductItem[] = [
  {
    id: 'usb-cable-100w',
    name: '100W Super Fast Charging Cable',
    price: 120,
    originalPrice: 550,
    image:
      'https://i.ibb.co/zHbD1qkM/file-0000000062688211a6bdd21db309ff09.png',
    images: [
      'https://i.ibb.co/zHbD1qkM/file-0000000062688211a6bdd21db309ff09.png',
      ...CABLE_DETAIL_IMAGES,
    ],
    category: 'cables',
    inStock: true,
    createdAt: '2026-09-20T10:00:00Z',
    isNewArrival: true,
    description:
      'Power Up Faster with 100W Super Fast Charging Cable. Features 480Mbps high-speed data transfer, 1 meter length, and ultra-durable nylon braiding for heavy-duty daily usage.',
    specifications: {
      'Connector Type': 'Type-C to Type-C Fast Charge',
      'Power Rating': '100W Super Fast Charging',
      'Data Transfer Rate': '480Mbps Data Transfer',
      'Cable Length': '1 Meter Cable',
      'Outer Material': 'Durable Nylon Braided',
      Compatibility:
        'Universal Type-C Phones, Tablets & Laptops',
    },
    warranty:
      '6 Months Replacement Warranty against manufacturing defects.',
    manufacturerInfo: {
      name: 'QukeBasket Technologies Private Limited',
      address:
        'Indiranagar 100ft Road, Bangalore, Karnataka - 560038',
      countryOfOrigin: 'India',
      packer:
        'Quke Fulfillment Hub, Electronic City, Bangalore - 560100',
    },
  },

  {
    id: 'prod-cable-1',
    name: 'Type-C to Type-C Cable 3A',
    price: 120,
    originalPrice: 399,
    image:
      'https://i.ibb.co/nNJ8wP5b/IMG-20260907-183147.jpg',
    images: CABLE_DETAIL_IMAGES,
    category: 'cables',
    inStock: true,
    createdAt: '2026-09-01T10:00:00Z',
    isNewArrival: false,
    description:
      'High-speed 3A Type-C to Type-C fast charging cable with 480 Mbps data synchronization. Built with high-durability braided fiber and reinforced connectors for universal smartphone and laptop compatibility.',
    specifications: {
      'Connector Type': 'USB Type-C to Type-C',
      'Output Current': '3A Max (Up to 60W Power Delivery)',
      'Cable Length': '1.0 Meter (3.3 ft)',
      'Data Transfer Rate': '480 Mbps',
      'Outer Material': 'Tangle-Free Double Braided Nylon',
      'Connector Shell': 'Anodized Aluminum Alloy',
      Compatibility:
        'Universal USB-C Smartphones, Tablets & Laptops',
    },
    warranty:
      '6 Months Replacement Warranty against manufacturing defects and connector failure.',
    manufacturerInfo: {
      name: 'QukeBasket Technologies Private Limited',
      address:
        'Indiranagar 100ft Road, Bangalore, Karnataka - 560038',
      countryOfOrigin: 'India',
      packer:
        'Quke Fulfillment Hub, Electronic City, Bangalore - 560100',
    },
  },

  {
    id: 'prod-cable-2',
    name: 'Type-C Cable 3A',
    price: 120,
    originalPrice: 399,
    image:
      'https://i.ibb.co/zT50xpPv/IMG-20260907-183248.jpg',
    category: 'cables',
    inStock: true,
    createdAt: '2026-09-05T09:00:00Z',
    isNewArrival: false,
  },

  {
    id: 'prod-charger-1',
    name: '33W GaN Dual Port Super Fast Charger',
    price: 200,
    originalPrice: 599,
    image: chargerImg,
    category: 'chargers',
    inStock: true,
    createdAt: '2026-09-15T14:30:00Z',
    isNewArrival: true,
    description:
      'Compact Gallium Nitride (GaN) 33W wall adapter with Dual Ports (Type-C PD + USB-A QuickCharge 3.0). Supports universal fast charging for smartphones, tablets, and lightweight ultrabooks.',
    specifications: {
      'Total Output': '33W Max',
      Ports: '1x USB Type-C (PD 3.0), 1x USB-A (QC 3.0)',
      Technology: 'GaN (Gallium Nitride) Heat-Safe',
      'Input Voltage': '100-240V AC 50/60Hz',
    },
    warranty: '1 Year Brand Replacement Warranty.',
  },

  {
    id: 'prod-earphones-1',
    name: 'HD Deep Bass Wired In-Ear Earphones with Mic',
    price: 99,
    originalPrice: 300,
    image:
      'https://i.ibb.co/yFhw6r9G/81-QGR4-I0x-QL-AC-UF1000-1000-QL80-FMwebp.webp',
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
      '10mm dynamic acoustic drivers delivering rich punchy bass and clear vocals. Features tangle-free cable, inline microphone, and 3.5mm jack.',
    specifications: {
      'Driver Size': '10mm Dynamic Titanium Drivers',
      Connector: '3.5mm Gold-Plated Jack',
      'Cable Length': '1.2m Durable TPE Wire',
      'Inline Remote': 'Single button playback & call mic',
    },
    warranty: '6 Months Replacement Warranty.',
  },

  {
    id: 'prod-cable-3',
    name: 'Heavy Duty 3A Type-C Cable 1m',
    price: 120,
    originalPrice: 399,
    image:
      'https://i.ibb.co/670wCJ1L/IMG-20260907-183236.jpg',
    category: 'cables',
    inStock: true,
    createdAt: '2026-09-04T12:00:00Z',
    isNewArrival: false,
  },

  {
    id: 'prod-cable-4',
    name: 'Type-C Cable 3A Pro',
    price: 120,
    originalPrice: 399,
    image:
      'https://i.ibb.co/yTN3Gj9/IMG-20260907-183311.jpg',
    category: 'cables',
    inStock: true,
    createdAt: '2026-09-06T14:00:00Z',
    isNewArrival: false,
  },
];
