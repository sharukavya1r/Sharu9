import { SavedAddress } from '../types';

export interface DeliveryCalculation {
  fee: number;
  isFree: boolean;
  hasAddress: boolean;
  zone: string;
  distanceDescription: string;
  originalStandardFee: number;
}

/**
 * Standard Delivery Fee Calculator for QukeBasket Mobile Accessories
 *
 * Rules:
 * - Orders ₹299 and above: FREE DELIVERY (₹0)
 * - Bengaluru Urban / Local (560xxx): ₹29
 * - Karnataka Region (561-599xxx): ₹39
 * - Nearby / Southern States (Tamil Nadu, Kerala, Andhra Pradesh, Telangana, Maharashtra, Goa): ₹49
 * - Central & West States (Gujarat, Rajasthan, MP, Chhattisgarh): ₹59
 * - North & East States (Delhi, Haryana, Punjab, UP, Bihar, WB, Odisha, Jharkhand, Uttarakhand, HP): ₹69
 * - Special / Remote / North-East / Island UTs (Assam, Meghalaya, Manipur, Mizoram, Nagaland, J&K, Ladakh, Andaman): ₹79
 *
 * Deterministic: The same address/PIN always produces the exact same charge.
 * When no valid address/PIN is provided, fee is not pre-assumed.
 */
export function getStandardDeliveryFee(address?: SavedAddress | null): {
  fee: number;
  hasAddress: boolean;
  zone: string;
  distanceDescription: string;
} {
  if (!address || !address.pincode) {
    return {
      fee: 0,
      hasAddress: false,
      zone: 'Calculated at checkout',
      distanceDescription: '',
    };
  }

  const pin = address.pincode.trim().replace(/\D/g, '');
  const state = (address.state || '').toUpperCase().trim();
  const city = (address.city || '').toLowerCase().trim();

  // Validate 6-digit Indian PIN
  if (pin.length === 6) {
    const prefix2 = pin.substring(0, 2);
    const prefix3 = pin.substring(0, 3);

    // 1. Local Bengaluru Urban (560xxx)
    if (prefix3 === '560' || city.includes('bangalore') || city.includes('bengaluru')) {
      return {
        fee: 29,
        hasAddress: true,
        zone: 'Local Bengaluru Area',
        distanceDescription: '~15 km',
      };
    }

    // 2. Karnataka State (561xxx - 599xxx)
    if (
      ['56', '57', '58', '59'].includes(prefix2) ||
      state.includes('KARNATAKA')
    ) {
      return {
        fee: 39,
        hasAddress: true,
        zone: 'Karnataka Regional',
        distanceDescription: '~250 km',
      };
    }

    // 3. Remote / North East / J&K / Island UTs
    const remotePrefixes2 = ['78', '79', '19', '18'];
    const remotePrefixes3 = ['744', '737'];
    if (
      remotePrefixes2.includes(prefix2) ||
      remotePrefixes3.includes(prefix3) ||
      pin.startsWith('68255') ||
      [
        'ASSAM',
        'MEGHALAYA',
        'MANIPUR',
        'MIZORAM',
        'NAGALAND',
        'TRIPURA',
        'ARUNACHAL',
        'SIKKIM',
        'KASHMIR',
        'LADAKH',
        'ANDAMAN',
        'NICOBAR',
        'LAKSHADWEEP',
      ].some((s) => state.includes(s))
    ) {
      return {
        fee: 79,
        hasAddress: true,
        zone: 'National Express (Special / Remote)',
        distanceDescription: '~2,100 km',
      };
    }

    // 4. Nearby Southern & Western States (Tamil Nadu, Kerala, Andhra Pradesh, Telangana, Maharashtra, Goa)
    const nearbyPrefixes = [
      '60', '61', '62', '63', '64', // Tamil Nadu & Pondicherry
      '67', '68', '69',             // Kerala
      '50', '51', '52', '53',       // Telangana / Andhra Pradesh
      '40', '41', '42', '43', '44', // Maharashtra & Goa
    ];
    if (
      nearbyPrefixes.includes(prefix2) ||
      ['TAMILNADU', 'TAMIL NADU', 'KERALA', 'ANDHRA PRADESH', 'TELANGANA', 'MAHARASHTRA', 'GOA', 'PONDICHERRY'].some((s) =>
        state.includes(s)
      )
    ) {
      return {
        fee: 49,
        hasAddress: true,
        zone: 'Southern & Western Region',
        distanceDescription: '~480 km',
      };
    }

    // 5. Central & Western States (Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh)
    if (
      ['30', '31', '32', '33', '34', '36', '37', '38', '39', '45', '46', '47', '48', '49'].includes(prefix2) ||
      ['GUJARAT', 'RAJASTHAN', 'MADHYA PRADESH', 'CHHATTISGARH', 'CHATTISGARH'].some((s) =>
        state.includes(s)
      )
    ) {
      return {
        fee: 59,
        hasAddress: true,
        zone: 'Central & Western Region',
        distanceDescription: '~950 km',
      };
    }

    // 6. North & East States (Delhi-NCR, Haryana, Punjab, UP, WB, Bihar, Odisha, Jharkhand, Uttarakhand, HP)
    return {
      fee: 69,
      hasAddress: true,
      zone: 'North & East National Zone',
      distanceDescription: '~1,500 km',
    };
  }

  return {
    fee: 0,
    hasAddress: false,
    zone: 'Calculated at checkout',
    distanceDescription: '',
  };
}

export function calculateDeliveryFee(
  address?: SavedAddress | null,
  subtotal: number = 0
): DeliveryCalculation {
  // ₹299+ cart subtotal = FREE DELIVERY
  const isFree = subtotal >= 299;
  const standard = getStandardDeliveryFee(address);

  return {
    fee: isFree ? 0 : standard.fee,
    isFree,
    hasAddress: standard.hasAddress,
    zone: standard.zone,
    distanceDescription: standard.distanceDescription,
    originalStandardFee: standard.fee,
  };
}

/**
 * Calculates estimated delivery date and time based on the actual order creation
 * timestamp and the delivery zone rules for the destination address.
 */
export function calculateEstimatedDelivery(
  createdAt: number = Date.now(),
  address?: SavedAddress | null
): string {
  const standard = getStandardDeliveryFee(address);
  let transitDays = 2;

  if (standard.zone.includes('Bengaluru')) {
    transitDays = 1;
  } else if (standard.zone.includes('Karnataka')) {
    transitDays = 2;
  } else if (standard.zone.includes('Southern')) {
    transitDays = 3;
  } else if (standard.zone.includes('Central')) {
    transitDays = 4;
  } else if (standard.zone.includes('North')) {
    transitDays = 4;
  } else if (standard.zone.includes('Special') || standard.zone.includes('Remote')) {
    transitDays = 6;
  }

  const targetDate = new Date(createdAt + transitDays * 24 * 60 * 60 * 1000);
  const formattedDate = targetDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return `${formattedDate} by 8:00 PM`;
}
