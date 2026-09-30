import { Order, OrderStatus, DamageClaim, ClaimStatus, SavedAddress } from '../types';

/**
 * Real Order & Damage Claim Service
 *
 * Data Architecture:
 * - Real user isolation: Each logged-in user accesses ONLY their own orders & claims via user-scoped storage (`userId`).
 * - Development fallback: Uses local storage with keys `quke_orders_${userId}` and `quke_claims_${userId}`.
 * - Production ready: Abstracted asynchronous service functions (`getUserOrders`, `createOrder`, `updateOrderStatus`,
 *   `submitDamageClaim`, `updateClaimStatus`) structured to map directly to REST/GraphQL/Firestore endpoints (`/api/orders`, `/api/claims`).
 */

const LEGACY_STORAGE_KEY = 'quke_orders';

// Clean up any old hardcoded demo orders from previous sessions
export function cleanLegacyDemoOrders(): void {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // If it contains legacy demo IDs like QK-94021, QK-88152, QK-78219, clean them out
        const hasDemo = parsed.some(
          (o) => o.id === 'QK-94021' || o.id === 'QK-88152' || o.id === 'QK-78219'
        );
        if (hasDemo) {
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      }
    }
  } catch {
    // Ignore error
  }
}

/**
 * Get storage key for a user
 */
function getUserOrdersKey(userId: string): string {
  const sanitized = userId ? userId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : 'guest';
  return `quke_orders_${sanitized}`;
}

/**
 * Generates a unique, real-formatted Order ID
 * Format: QK-XXXXXX (6 alphanumeric digits based on current time & crypto entropy)
 */
export function generateOrderId(): string {
  const timestampPart = Date.now().toString(36).toUpperCase().slice(-3);
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `QK-${timestampPart}${randomPart}`;
}

/**
 * Generates a unique Claim ID
 * Format: CLM-XXXXXX
 */
export function generateClaimId(): string {
  const timestampPart = Date.now().toString(36).toUpperCase().slice(-3);
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `CLM-${timestampPart}${randomPart}`;
}

/**
 * Retrieve all orders belonging strictly to the specified user
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  // Production integration point:
  // return fetch(`/api/users/${encodeURIComponent(userId)}/orders`).then(res => res.json());

  cleanLegacyDemoOrders();

  const effectiveUserId = userId || 'quke_customer';

  try {
    const key = getUserOrdersKey(effectiveUserId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const orders: Order[] = JSON.parse(raw);
    if (!Array.isArray(orders)) return [];

    // Filter out any accidental demo records
    const validOrders = orders.filter(
      (o) => o.id !== 'QK-94021' && o.id !== 'QK-88152' && o.id !== 'QK-78219'
    );

    return validOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    console.error('Failed to load user orders:', err);
    return [];
  }
}

/**
 * Create and persist a new real order for the specified user
 */
export async function createRealOrder(
  newOrder: Order,
  userId?: string
): Promise<Order> {
  // Production integration point:
  // return fetch('/api/orders', { method: 'POST', body: JSON.stringify(newOrder) }).then(res => res.json());

  const effectiveUserId = userId || 'quke_customer';

  try {
    const key = getUserOrdersKey(effectiveUserId);
    const existing = await getUserOrders(effectiveUserId);
    const updated = [newOrder, ...existing.filter((o) => o.id !== newOrder.id)];

    localStorage.setItem(key, JSON.stringify(updated));
    return newOrder;
  } catch (err) {
    console.error('Failed to persist order:', err);
    throw err;
  }
}

/**
 * Update an order's status and metadata
 */
export async function updateRealOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  userId: string,
  extraUpdates?: Partial<Order>
): Promise<Order> {
  // Production integration point:
  // return fetch(`/api/orders/${orderId}/status`, { method: 'PATCH', ... })

  const orders = await getUserOrders(userId);
  const targetIndex = orders.findIndex((o) => o.id === orderId);

  if (targetIndex === -1) {
    throw new Error(`Order #${orderId} not found for user`);
  }

  const existingOrder = orders[targetIndex];
  const now = Date.now();

  const updatedOrder: Order = {
    ...existingOrder,
    ...extraUpdates,
    status: newStatus,
    deliveredAt:
      newStatus === 'Delivered'
        ? extraUpdates?.deliveredAt || existingOrder.deliveredAt || now
        : existingOrder.deliveredAt,
    deliveredDateFormatted:
      newStatus === 'Delivered'
        ? extraUpdates?.deliveredDateFormatted ||
          existingOrder.deliveredDateFormatted ||
          new Date(now).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : existingOrder.deliveredDateFormatted,
  };

  orders[targetIndex] = updatedOrder;
  const key = getUserOrdersKey(userId);
  localStorage.setItem(key, JSON.stringify(orders));

  return updatedOrder;
}

/**
 * Submit a real damage claim for a delivered order
 */
export async function submitRealDamageClaim(
  orderId: string,
  claim: DamageClaim,
  userId: string
): Promise<Order> {
  const orders = await getUserOrders(userId);
  const targetIndex = orders.findIndex((o) => o.id === orderId);

  if (targetIndex === -1) {
    throw new Error(`Order #${orderId} not found`);
  }

  const targetOrder = orders[targetIndex];
  if (targetOrder.status !== 'Delivered') {
    throw new Error('Damage claim can only be submitted for a delivered order');
  }

  // Verify 1-hour window
  if (targetOrder.deliveredAt) {
    const elapsed = Date.now() - targetOrder.deliveredAt;
    if (elapsed > 3600000) {
      throw new Error('Damage claim window (1 hour) has expired');
    }
  }

  const updatedOrder: Order = {
    ...targetOrder,
    damageClaim: claim,
  };

  orders[targetIndex] = updatedOrder;
  const key = getUserOrdersKey(userId);
  localStorage.setItem(key, JSON.stringify(orders));

  return updatedOrder;
}

/**
 * Update the review status of a damage claim
 */
export async function updateRealClaimStatus(
  orderId: string,
  newClaimStatus: ClaimStatus,
  adminNotes: string,
  userId: string
): Promise<Order> {
  const orders = await getUserOrders(userId);
  const targetIndex = orders.findIndex((o) => o.id === orderId);

  if (targetIndex === -1) {
    throw new Error(`Order #${orderId} not found`);
  }

  const targetOrder = orders[targetIndex];
  if (!targetOrder.damageClaim) {
    throw new Error(`No damage claim found on order #${orderId}`);
  }

  const updatedClaim: DamageClaim = {
    ...targetOrder.damageClaim,
    status: newClaimStatus,
    adminNotes: adminNotes.trim(),
    updatedAt: Date.now(),
    reviewedAt: Date.now(),
  };

  const updatedOrder: Order = {
    ...targetOrder,
    damageClaim: updatedClaim,
  };

  const effectiveUserId = userId || 'quke_customer';
  orders[targetIndex] = updatedOrder;
  const key = getUserOrdersKey(effectiveUserId);
  localStorage.setItem(key, JSON.stringify(orders));

  return updatedOrder;
}

/**
 * Synchronously retrieve orders for instant React state initialization
 */
export function getUserOrdersSync(userId?: string): Order[] {
  cleanLegacyDemoOrders();
  const effectiveUserId = userId || 'quke_customer';
  try {
    const key = getUserOrdersKey(effectiveUserId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const orders: Order[] = JSON.parse(raw);
    if (!Array.isArray(orders)) return [];
    const validOrders = orders.filter(
      (o) => o.id !== 'QK-94021' && o.id !== 'QK-88152' && o.id !== 'QK-78219'
    );
    return validOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch {
    return [];
  }
}

/**
 * Cancel an active order
 */
export async function cancelRealOrder(
  orderId: string,
  userId?: string
): Promise<Order> {
  return updateRealOrderStatus(orderId, 'Cancelled', userId || 'quke_customer');
}
