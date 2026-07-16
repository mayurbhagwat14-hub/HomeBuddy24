const express = require('express');
const router = express.Router();
const adminStoreOrderController = require('../../controllers/adminControllers/adminStoreOrderController');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Get stats
router.get('/stats', authenticate, isAdmin, adminStoreOrderController.getStoreOrderStats);

// Get list of orders
router.get('/', authenticate, isAdmin, adminStoreOrderController.getStoreOrders);

// Update order status
router.patch('/:id/status', authenticate, isAdmin, adminStoreOrderController.updateOrderStatus);

module.exports = router;
