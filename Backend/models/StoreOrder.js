const mongoose = require('mongoose');
const { STORE_ORDER_STATUS, PAYMENT_STATUS } = require('../utils/constants');

const storeOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreProduct',
    required: true
  },
  productSnapshot: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: null },
    category: { type: String }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_method: {
    type: String,
    enum: ['cash', 'online'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  paymentId: {
    type: String,
    default: null
  },
  razorpayOrderId: {
    type: String,
    default: null,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  customerConfirmationOTP: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: Object.values(STORE_ORDER_STATUS),
    default: STORE_ORDER_STATUS.PENDING,
    index: true
  },
  delivery_address: {
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  // Timestamps
  acceptedAt: { type: Date, default: null },
  onTheWayAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  cancellationReason: { type: String, default: null }

}, {
  timestamps: true
});

// Generate unique order number
storeOrderSchema.pre('validate', function (next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `SO${timestamp}${random}`;
  }
  next();
});

// Indexes for queries
storeOrderSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('StoreOrder', storeOrderSchema);
