/**
 * Application Constants
 */

// User Roles
const USER_ROLES = {
  USER: 'USER',
  VENDOR: 'VENDOR',
  WORKER: 'WORKER',
  ADMIN: 'ADMIN'
};

// Token Types
const TOKEN_TYPES = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
  PHONE_VERIFICATION: 'PHONE_VERIFICATION',
  REFRESH_TOKEN: 'REFRESH_TOKEN'
};

// Vendor Approval Status
const VENDOR_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

// Worker Status
const WORKER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE'
};

// Booking Status
const BOOKING_STATUS = {
  SEARCHING: 'searching', // Initial search phase
  REQUESTED: 'requested', // Waiting for vendor to accept
  AWAITING_PAYMENT: 'awaiting_payment', // Accepted by vendor, waiting for user payment
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ACCEPTED: 'accepted',
  ASSIGNED: 'assigned',
  JOURNEY_STARTED: 'journey_started',
  VISITED: 'visited',
  IN_PROGRESS: 'in_progress',
  WORK_DONE: 'work_done',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  NO_VENDORS: 'no_vendors'
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  COLLECTED_BY_VENDOR: 'collected_by_vendor',
  PLAN_COVERED: 'plan_covered' // For plan_benefit bookings until bill is finalized
};

// Store Product Status
const STORE_PRODUCT_STATUS = {
  PENDING: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DEACTIVATED: 'deactivated'
};

// Store Order Status
const STORE_ORDER_STATUS = {
  BROADCASTED: 'broadcasted',
  ACCEPTED: 'accepted',
  ON_THE_WAY: 'on_the_way',
  REACHED: 'reached',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  UNFULFILLED: 'unfulfilled'
};

// Service Status
const SERVICE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted'
};

// Bill Status
const BILL_STATUS = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

module.exports = {
  USER_ROLES,
  TOKEN_TYPES,
  VENDOR_STATUS,
  WORKER_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SERVICE_STATUS,
  BILL_STATUS,
  STORE_PRODUCT_STATUS,
  STORE_ORDER_STATUS
};
