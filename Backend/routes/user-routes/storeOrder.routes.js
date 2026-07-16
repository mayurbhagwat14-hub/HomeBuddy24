const express = require('express');
const router = express.Router();
const storeOrderController = require('../../controllers/userControllers/storeOrderController');
const { authenticate } = require('../../middleware/authMiddleware');
const { isUser } = require('../../middleware/roleMiddleware');

router.use(authenticate, isUser);

router.post('/', storeOrderController.placeOrder);
router.get('/', storeOrderController.getMyOrders);
router.get('/:id', storeOrderController.getOrderDetail);
router.post('/:id/cancel', storeOrderController.cancelOrder);
router.delete('/:id', storeOrderController.deleteOrder);

module.exports = router;
