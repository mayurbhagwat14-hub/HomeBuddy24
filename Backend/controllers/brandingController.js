const BrandingSetting = require('../models/BrandingSetting');
const BrandingAuditLog = require('../models/BrandingAuditLog');

// Default branding values
const DEFAULT_BRANDING = {
  appName: 'HomeBuddy24',
  appLogo: '',
  favicon: '',
  loginLogo: '',
  splashLogo: ''
};

/**
 * Get public branding configuration
 * @route GET /api/branding/public
 * @access Public
 */
const getPublicBranding = async (req, res) => {
  try {
    let branding = await BrandingSetting.findOne();
    if (!branding) {
      branding = DEFAULT_BRANDING;
    }
    
    res.status(200).json({
      success: true,
      data: {
        appName: branding.appName,
        appLogo: branding.appLogo,
        favicon: branding.favicon,
        loginLogo: branding.loginLogo,
        splashLogo: branding.splashLogo
      }
    });
  } catch (error) {
    console.error('Error fetching public branding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branding'
    });
  }
};

/**
 * Get branding configuration (Admin)
 * @route GET /api/branding
 * @access Admin Auth
 */
const getBranding = async (req, res) => {
  try {
    let branding = await BrandingSetting.findOne();
    if (!branding) {
      branding = new BrandingSetting(DEFAULT_BRANDING);
      await branding.save();
    }
    
    res.status(200).json({
      success: true,
      data: branding
    });
  } catch (error) {
    console.error('Error fetching branding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branding'
    });
  }
};

/**
 * Update branding text fields
 * @route PUT /api/branding
 * @access Admin Auth
 */
const updateBranding = async (req, res) => {
  try {
    const { appName } = req.body;
    
    let branding = await BrandingSetting.findOne();
    if (!branding) {
      branding = new BrandingSetting(DEFAULT_BRANDING);
    }

    const oldAppName = branding.appName;
    
    if (appName !== undefined) {
      branding.appName = appName;
    }
    branding.updatedBy = req.user.id; // From auth middleware
    await branding.save();

    // Log the change
    if (oldAppName !== branding.appName) {
      await BrandingAuditLog.create({
        adminId: req.user.id,
        adminName: req.user.name || req.user.email || 'Admin',
        oldAppName: oldAppName,
        newAppName: branding.appName,
        oldLogo: branding.appLogo,
        newLogo: branding.appLogo
      });
    }

    res.status(200).json({
      success: true,
      message: 'Branding updated successfully',
      data: branding
    });
  } catch (error) {
    console.error('Error updating branding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update branding'
    });
  }
};

/**
 * Upload and update branding logo
 * @route POST /api/branding/logo
 * @access Admin Auth
 */
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    let branding = await BrandingSetting.findOne();
    if (!branding) {
      branding = new BrandingSetting(DEFAULT_BRANDING);
    }

    const { type } = req.body;
    const validTypes = ['appLogo', 'favicon', 'loginLogo', 'splashLogo'];
    const fieldType = validTypes.includes(type) ? type : 'appLogo';

    const oldLogo = branding[fieldType];
    
    // multer-storage-cloudinary gives us the Cloudinary URL in req.file.path
    branding[fieldType] = req.file.path; 
    branding.updatedBy = req.user.id;
    await branding.save();

    // Log the change
    await BrandingAuditLog.create({
      adminId: req.user.id,
      adminName: req.user.name || req.user.email || 'Admin',
      oldAppName: branding.appName,
      newAppName: branding.appName,
      oldLogo: oldLogo,
      newLogo: branding[fieldType]
    });

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: branding
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo'
    });
  }
};

module.exports = {
  getPublicBranding,
  getBranding,
  updateBranding,
  uploadLogo
};
