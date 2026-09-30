export interface SupportConfig {
  instagramUrl: string;
  telegramUrl: string;
  facebookUrl: string;
  supportEmail: string;
  tollFreeNumber: string;
  tollFreeTel: string;
  whatsappNumber: string;
  whatsappUrl: string;
}

export const SUPPORT_CONFIG: SupportConfig = {
  // Configured via environment variables; empty string indicates not configured
  instagramUrl: (import.meta.env.VITE_INSTAGRAM_URL || '').trim(),
  telegramUrl: (import.meta.env.VITE_TELEGRAM_URL || '').trim(),
  facebookUrl: (import.meta.env.VITE_FACEBOOK_URL || '').trim(),
  // Official QukeBasket customer support email
  supportEmail: (import.meta.env.VITE_SUPPORT_EMAIL || 'support@qukebasket.in').trim(),
  tollFreeNumber: '1800-QUKE-BASKET',
  tollFreeTel: '180078532275',
  whatsappNumber: '+91 98765 43210',
  whatsappUrl: 'https://wa.me/919876543210?text=Hello%20QukeBasket%20Support%2C%20I%20need%20help%20with%20an%20order.',
};
