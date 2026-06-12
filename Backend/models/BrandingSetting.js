const mongoose = require('mongoose');

const brandingSettingSchema = new mongoose.Schema({
  appName: {
    type: String,
    default: 'HomeBuddy24'
  },
  appLogo: {
    type: String,
    default: ''
  },
  favicon: {
    type: String,
    default: ''
  },
  loginLogo: {
    type: String,
    default: ''
  },
  splashLogo: {
    type: String,
    default: ''
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('BrandingSetting', brandingSettingSchema);
