const express = require('express');
const router = express.Router();
const { getPublicBranding, getBranding, updateBranding, uploadLogo } = require('../../controllers/brandingController');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const { uploadImage } = require('../../middleware/uploadMiddleware');
const { USER_ROLES } = require('../../utils/constants');

// Public route (accessible anywhere without auth)
router.get('/public', getPublicBranding);

// Admin-only routes
router.use(authenticate);
router.use(isAdmin);

router.get('/', getBranding);
router.put('/', updateBranding);
router.post('/logo', uploadImage, uploadLogo);

module.exports = router;
