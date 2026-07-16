const mongoose = require('mongoose');

const storeProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock_qty: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  images: [{
    type: String // Cloudinary URLs
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StoreProduct', storeProductSchema);
