const express = require('express');
const router = express.Router();
const userStoreController = require('../../controllers/userControllers/userStoreController');
const { authenticate } = require('../../middleware/authMiddleware');
const { isUser } = require('../../middleware/roleMiddleware');

// Public routes (anyone can browse products)
router.get('/products', userStoreController.getProducts);
router.get('/products/:id', userStoreController.getProductDetails);
router.get('/categories', userStoreController.getCategories);

// Protected routes (requires user login)
router.use(authenticate, isUser);
router.get('/cart', userStoreController.getCart);
router.post('/cart', userStoreController.updateCartItem);
router.put('/cart', userStoreController.updateCartItem);
router.delete('/cart/:itemId', userStoreController.removeCartItem);
router.delete('/cart', userStoreController.clearCart);

module.exports = router;
