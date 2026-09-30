export const CLAIM_WINDOW_MS = 60 * 60 * 1000; // 1 hour (3600000 ms)

export interface ClaimWindowInfo {
  remainingMs: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formattedDeliveryTime: string;
  formattedRemaining: string;
}

export function getClaimWindowInfo(
  deliveredAt?: number,
  now: number = Date.now()
): ClaimWindowInfo {
  if (!deliveredAt) {
    return {
      remainingMs: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formattedDeliveryTime: 'Not yet delivered',
      formattedRemaining: 'Not applicable',
    };
  }

  const deadline = deliveredAt + CLAIM_WINDOW_MS;
  const remainingMs = deadline - now;
  const isExpired = remainingMs <= 0;

  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const dateObj = new Date(deliveredAt);
  const hours = dateObj.getHours();
  const mins = dateObj.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const formattedDeliveryTime = `${dateObj.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })} at ${hours12}:${mins} ${ampm}`;

  let formattedRemaining = '';
  if (isExpired) {
    formattedRemaining = 'Expired (over 1 hour since delivery)';
  } else if (minutes > 0) {
    formattedRemaining = `${minutes} minute${minutes === 1 ? '' : 's'} ${seconds}s remaining`;
  } else {
    formattedRemaining = `${seconds}s remaining`;
  }

  return {
    remainingMs,
    minutes,
    seconds,
    isExpired,
    formattedDeliveryTime,
    formattedRemaining,
  };
}

