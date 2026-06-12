const mongoose = require('mongoose');

const brandingAuditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  oldAppName: {
    type: String,
    default: ''
  },
  newAppName: {
    type: String,
    default: ''
  },
  oldLogo: {
    type: String,
    default: ''
  },
  newLogo: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('BrandingAuditLog', brandingAuditLogSchema);
