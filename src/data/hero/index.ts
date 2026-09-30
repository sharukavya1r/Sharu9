import chargerImg from './images/charger_adapter_1788669515816.jpg';
import cableImg from './images/cable_type_c_1788669499009.jpg';
import earphonesImg from './images/wired_earphones_1788669538273.jpg';

export interface HeroBannerSlide {
  id: string | number;
  titleLine1?: string;
  titleLine2?: string;
  line1?: string;
  line2?: string;
  subtitle: string;
  ctaText?: string;
  features?: string[];
  categoryId?: string;
  image?: string;
  svgType?: string;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  fullBanner?: boolean;
}

export const HERO_BANNERS: HeroBannerSlide[] = [
  {
    id: 'hero-chargers',
    titleLine1: 'Fast & Safe',
    titleLine2: 'Chargers',
    subtitle: 'High Speed Fast Charging Adapters',
    ctaText: 'Shop Now',
    features: [
      'High Speed Output',
      'Overheat Protection',
      'Universal Support',
      'Compact & Durable',
    ],
    categoryId: 'chargers',
    image: chargerImg,
    price: 249,
    originalPrice: 799,
    discountPercent: 68,
  },
  {
    id: 'hero-usb-cables',
    titleLine1: 'High Speed',
    titleLine2: 'USB Cables',
    subtitle: '100W Super Fast Charging Cable',
    ctaText: 'Shop Now',
    features: [
      '100W Fast Charging',
      '480Mbps Data Transfer',
      'Durable Braided Wire',
      'Universal Compatibility',
    ],
    categoryId: 'cables',
    image: cableImg,
    price: 120,
    originalPrice: 550,
    discountPercent: 78,
  },
  {
    id: 'hero-headphones',
    titleLine1: 'Clear Sound,',
    titleLine2: 'Headphones',
    subtitle: 'Premium HD Audio & Deep Bass',
    ctaText: 'Shop Now',
    features: [
      'HD Stereo Sound',
      'Deep Bass Driver',
      'Noise Isolation',
      'Built-in HD Mic',
    ],
    categoryId: 'earphones',
    image: earphonesImg,
    price: 149,
    originalPrice: 499,
    discountPercent: 70,
  },
];

export const HERO_SLIDES = HERO_BANNERS;
