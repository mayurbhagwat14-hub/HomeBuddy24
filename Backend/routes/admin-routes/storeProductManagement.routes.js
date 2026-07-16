const express = require('express');
const router = express.Router();
const adminStoreController = require('../../controllers/adminControllers/adminStoreController');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// All routes require admin authentication
router.use(authenticate, isAdmin);

// Admin Store Product routes
router.get('/products', adminStoreController.getAllProducts);
router.get('/products/:id', adminStoreController.getProductById);
router.post('/products', adminStoreController.createProduct);
router.put('/products/:id', adminStoreController.updateProduct);
router.delete('/products/:id', adminStoreController.deleteProduct);

module.exports = router;
