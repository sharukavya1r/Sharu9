import heroAccessoriesImg from './data/hero/images/tech_hero_accessories_1788669483676.jpg';
import cableImg from './assets/images/cable_type_c_1788669499009.jpg';
import redBlackCableImg from './assets/images/red_black_cable_1788793385852.jpg';
import chargerImg from './assets/images/charger_adapter_1788669515816.jpg';
import earphonesImg from './assets/images/wired_earphones_1788669538273.jpg';
import powerBankImg from './assets/images/power_bank_1788669551401.jpg';
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
  { id: 'cases', name: 'Mobile Cases', icon: 'case' },
  { id: 'more', name: 'More', icon: 'more' },
];

const caseImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="16" fill="%23f8fafc"/><rect x="34" y="16" width="52" height="88" rx="10" fill="%23001f3f"/><rect x="40" y="24" width="40" height="72" rx="6" fill="%231e293b"/><rect x="42" y="26" width="18" height="20" rx="4" fill="%23FF8C00"/><circle cx="51" cy="36" r="4" fill="%23ffffff"/><circle cx="60" cy="60" r="14" stroke="%23FF8C00" stroke-width="2.5" stroke-dasharray="4 2"/></svg>`;

const carChargerImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="16" fill="%23f8fafc"/><path d="M46 30h28l4 28h8a4 4 0 0 1 4 4v22a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V62a4 4 0 0 1 4-4h8l4-28z" fill="%23001f3f"/><rect x="55" y="20" width="10" height="10" rx="2" fill="%23FF8C00"/><rect x="46" y="70" width="12" height="7" rx="2" fill="%23ffffff"/><rect x="62" y="70" width="12" height="7" rx="2" fill="%23ffffff"/><circle cx="60" cy="85" r="2.5" fill="%23FF8C00"/></svg>`;

const screenProtectorImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="16" fill="%23f8fafc"/><rect x="36" y="18" width="48" height="84" rx="8" fill="%23001f3f"/><rect x="32" y="16" width="52" height="84" rx="8" fill="%23ffffff" fill-opacity="0.85" stroke="%23FF8C00" stroke-width="2"/><path d="M40 80L80 36" stroke="%2338bdf8" stroke-width="3" stroke-linecap="round"/><circle cx="70" cy="74" r="12" fill="%23FF8C00"/><text x="70" y="78" text-anchor="middle" fill="%23ffffff" font-size="9" font-weight="bold" font-family="sans-serif">9H</text></svg>`;

const memoryCardImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="16" fill="%23f8fafc"/><path d="M36 28a6 6 0 0 1 6-6h36a6 6 0 0 1 6 6v64a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6V54l-4-4v-16l4-4v-2z" fill="%23001f3f"/><rect x="44" y="26" width="5" height="12" rx="1.5" fill="%23FF8C00"/><rect x="52" y="26" width="5" height="12" rx="1.5" fill="%23FF8C00"/><rect x="60" y="26" width="5" height="12" rx="1.5" fill="%23FF8C00"/><rect x="68" y="26" width="5" height="12" rx="1.5" fill="%23FF8C00"/><text x="60" y="62" text-anchor="middle" fill="%23ffffff" font-size="11" font-weight="bold" font-family="sans-serif">MicroSD</text><text x="60" y="78" text-anchor="middle" fill="%23FF8C00" font-size="14" font-weight="bold" font-family="sans-serif">64GB</text></svg>`;

const holderImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="16" fill="%23f8fafc"/><ellipse cx="60" cy="98" rx="34" ry="10" fill="%23001f3f"/><path d="M60 68v28" stroke="%23001f3f" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="64" r="8" fill="%23FF8C00"/><rect x="38" y="24" width="44" height="40" rx="6" fill="%23001f3f"/><rect x="44" y="28" width="32" height="32" rx="4" fill="%23ffffff"/><path d="M30 44h8M82 44h8" stroke="%23FF8C00" stroke-width="4" stroke-linecap="round"/></svg>`;

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
    id: 'prod-cable-100w',
    name: '100W Super Fast Charging Cable',
    price: 120,
    originalPrice: 550,
    discountPercent: 78,
    image: 'https://i.ibb.co/zHbD1qkM/file-0000000062688211a6bdd21db309ff09.png',
    images: ['https://i.ibb.co/zHbD1qkM/file-0000000062688211a6bdd21db309ff09.png', ...CABLE_DETAIL_IMAGES],
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
      'Compatibility': 'Universal Type-C Phones, Tablets & Laptops',
    },
    warranty: '6 Months Replacement Warranty against manufacturing defects.',
    manufacturerInfo: {
      name: 'QukeBasket Technologies Private Limited',
      address: 'Indiranagar 100ft Road, Bangalore, Karnataka - 560038',
      countryOfOrigin: 'India',
      packer: 'Quke Fulfillment Hub, Electronic City, Bangalore - 560100',
    },
  },
  {
    id: 'prod-cable-1',
    name: 'Type-C to Type-C Cable 3A',
    price: 199,
    originalPrice: 399,
    discountPercent: 50,
    image: 'https://i.ibb.co/nNJ8wP5b/IMG-20260907-183147.jpg',
    images: CABLE_DETAIL_IMAGES,
    category: 'cables',
    inStock: true,
    createdAt: '2026-09-01T10:00:00Z',
    isNewArrival: false,
    description: 'High-speed 3A Type-C to Type-C fast charging cable with 480 Mbps data synchronization. Built with high-durability braided fiber and reinforced connectors for universal smartphone and laptop compatibility.',
    specifications: {
      'Connector Type': 'USB Type-C to Type-C',
      'Output Current': '3A Max (Up to 60W Power Delivery)',
      'Cable Length': '1.0 Meter (3.3 ft)',
      'Data Transfer Rate': '480 Mbps',
      'Outer Material': 'Tangle-Free Double Braided Nylon',
      'Connector Shell': 'Anodized Aluminum Alloy',
      'Compatibility': 'Universal USB-C Smartphones, Tablets & Laptops',
    },
    warranty: '6 Months Replacement Warranty against manufacturing defects and connector failure. For warranty claims, contact support@qukebasket.in or 1800-QUKE-BASKET.',
    manufacturerInfo: {
      name: 'QukeBasket Technologies Private Limited',
      address: 'Indiranagar 100ft Road, Bangalore, Karnataka - 560038',
      countryOfOrigin: 'India',
      packer: 'Quke Fulfillment Hub, Electronic City, Bangalore - 560100',
    },
  },
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
    description: 'Compact Gallium Nitride (GaN) 33W wall adapter with Dual Ports (Type-C PD + USB-A QuickCharge 3.0). Supports universal fast charging for smartphones, tablets, and lightweight ultrabooks.',
    specifications: {
      'Total Output': '33W Max',
      'Ports': '1x USB Type-C (PD 3.0), 1x USB-A (QC 3.0)',
      'Technology': 'GaN (Gallium Nitride) Heat-Safe',
      'Input Voltage': '100-240V AC 50/60Hz',
    },
    warranty: '1 Year Brand Replacement Warranty.',
  },
  {
    id: 'prod-powerbank-1',
    name: 'boAt 20000 mAh 22.5 W Compact Pocket Size Power Bank',
    price: 1699,
    originalPrice: 4499,
    discountPercent: 62,

    image: 'https://i.ibb.co/9HLx0y3Z/IMG-20260920-161050.jpg',

    images: [
      'https://i.ibb.co/9HLx0y3Z/IMG-20260920-161050.jpg',
      'https://i.ibb.co/SXN7Zvfk/IMG-20260920-161108.jpg',
      'https://i.ibb.co/4RzMm5Vg/IMG-20260920-161036.jpg',
      'https://i.ibb.co/zVVCQXC0/IMG-20260920-161003.jpg',
      'https://i.ibb.co/4ZLkh7Ps/IMG-20260920-160933.jpg',
      'https://i.ibb.co/bgZ5CVGj/IMG-20260920-160914.jpg',
      'https://i.ibb.co/BHM09QHD/IMG-20260920-161021.jpg',
    ],

    category: 'power-banks',
    inStock: true,
    createdAt: '2026-09-12T09:15:00Z',
    isNewArrival: true,

    description:
      'boAt 20000 mAh 22.5 W Compact Pocket Size Power Bank with Lithium Polymer Battery, Fast Charging, Quick Charge 3.0 and Power Delivery 3.0. Suitable for laptops, mobile phones, tablets and speakers.',

    specifications: {
      'Battery Capacity': '20,000 mAh Lithium Polymer Battery',
      'Output Power': '22.5W Fast Charging',
      'Output Ports': '2x USB-A Output Ports + 1x Type-C Two-Way Port',
      'Charging Technology': 'Quick Charge 3.0 / Power Delivery 3.0',
      'Charging Feature': 'Pass-Through Charging',
      'Battery Type': 'Lithium Polymer',
    },

    warranty: '1 Year Domestic Warranty.',
  },
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
    description: 'High-clarity 9H tempered glass with oleophobic anti-fingerprint coating and bubble-free silicone adhesive installation.',
    specifications: {
      'Hardness': '9H Scratch-Proof Diamond Glass',
      'Coating': 'Oleophobic Electroplated Anti-Smudge',
      'Thickness': '0.33mm Ultra-Thin',
    },
    warranty: 'Immediate Replacement upon transit damage.',
  },
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
    description: 'Heavy-duty aluminum alloy car cigarette socket adapter with dual simultaneous high-speed charging outputs and subtle blue ring LED.',
    specifications: {
      'Total Output': '36W Turbo Charge',
      'Ports': '1x USB-C PD 20W + 1x USB-A QC 18W',
      'Material': 'Full Metal Aluminum Housing',
    },
    warranty: '1 Year Warranty.',
  },
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
    description: 'Up to 100MB/s read speeds, Class 10 U3 V30 speed specification suitable for Full HD and 4K video recording on smartphones, dash cams, and action cameras.',
    specifications: {
      'Capacity': '64GB',
      'Speed Class': 'Class 10, UHS-I (U3), V30',
      'Read Speed': 'Up to 100 MB/s',
    },
    warranty: '1 Years Limited Warranty.',
  },
  {
    id: 'prod-cable-2',
    name: 'Reinforced 3A Fast Type-C Cable 1.2m',
    price: 150,
    originalPrice: 499,
    discountPercent: 50,
    image: 'https://i.ibb.co/1fyHn1VW/IMG-20260907-183202.jpg',
    category: 'cables',
    inStock: true,
    createdAt: '2026-09-02T11:00:00Z',
    isNewArrival: false,
    description: 'Ultra-durable fast charging 3A Type-C cable featuring reinforced strain-relief collars and copper core wiring for daily use.',
    specifications: {
      'Connector Type': 'Type-C to Type-C',
      'Current': '3.0A Fast Charge',
      'Cable Length': '1.2 Meters',
      'Material': 'Braided Cotton Fiber',
    },
    warranty: '6 Months QukeBasket Warranty against internal breakage.',
  },
  {
    id: 'prod-cable-3',
    name: 'Type-C to Type-C Cable 3A Red Series',
    price: 199,
    originalPrice: 399,
    discountPercent: 50,
    image: 'https://i.ibb.co/DDyK07K1/IMG-20260907-183222.jpg',
    category: 'cables',
    inStock: true,
    createdAt: '2026-09-03T15:00:00Z',
    isNewArrival: false,
  },
  {
    id: 'prod-cable-4',
    name: 'Heavy Duty 3A Type-C Cable 1m',
    price: 199,
    originalPrice: 399,
    discountPercent: 50,
    image: 'https://i.ibb.co/670wCJ1L/IMG-20260907-183236.jpg',
    category: 'cables',
    inStock: true,
    createdAt: '2026-09-04T12:00:00Z',
    isNewArrival: false,
  },
  {
    id: 'prod-cable-5',
    name: 'Fast Sync Type-C Cable 3A',
    price: 199,
    originalPrice: 399,
    discountPercent: 50,
    image: 'https://i.ibb.co/zT50xpPv/IMG-20260907-183248.jpg',
    category: 'cables',
    inStock: true,
    createdAt: '2026-09-05T09:00:00Z',
    isNewArrival: false,
  },
  {
    id: 'prod-cable-6',
    name: 'Type-C to Type-C Cable 3A Pro',
    price: 199,
    originalPrice: 399,
    discountPercent: 50,
    image: 'https://i.ibb.co/yTN3Gj9/IMG-20260907-183311.jpg',
    category: 'cables',
    inStock: true,
    createdAt: '2026-09-06T14:00:00Z',
    isNewArrival: false,
  },
];
