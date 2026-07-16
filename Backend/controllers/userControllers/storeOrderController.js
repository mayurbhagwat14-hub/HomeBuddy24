const StoreOrder = require('../../models/StoreOrder');
const StoreProduct = require('../../models/StoreProduct');
const StoreCart = require('../../models/StoreCart');

/**
 * Place a new store order
 */
const placeOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity, deliveryAddress, paymentMethod } = req.body;

    if (!productId || !quantity || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Missing required order details' });
    }

    // 1. Validate product and stock
    const product = await StoreProduct.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Product not available' });
    }

    if (product.stock_qty < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock_qty} items left in stock` });
    }

    const totalAmount = product.price * quantity;

    // 2. Create the StoreOrder
    const order = new StoreOrder({
      user_id: userId,
      product_id: productId,
      productSnapshot: {
        name: product.name,
        price: product.price,
        image: product.images?.[0] || null,
        category: product.category
      },
      quantity,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      delivery_address: deliveryAddress,
      status: 'pending'
    });

    await order.save();

    // Deduct stock quantity
    product.stock_qty -= quantity;
    await product.save();

    // 3. Remove from cart if it was there
    await StoreCart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId: productId } } }
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Error placing store order:', error);
    res.status(500).json({ success: false, message: 'Server error placing order' });
  }
};

/**
 * Get user's store orders
 */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await StoreOrder.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StoreOrder.countDocuments({ user_id: userId });

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching my orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
};

/**
 * Get specific order details
 */
const getOrderDetail = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await StoreOrder.findOne({ _id: id, user_id: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, message: 'Server error fetching order' });
  }
};

/**
 * Cancel order
 */
const cancelOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await StoreOrder.findOne({ _id: id, user_id: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Order cannot be cancelled in status: ${order.status}` });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = 'Cancelled by user';
    await order.save();

    // Restore stock quantity
    const product = await StoreProduct.findById(order.product_id);
    if (product) {
      product.stock_qty += order.quantity;
      await product.save();
    }

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Server error cancelling order' });
  }
};

/**
 * Delete order from history
 */
const deleteOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await StoreOrder.findOne({ _id: id, user_id: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Only completed or cancelled orders can be deleted' });
    }

    await StoreOrder.deleteOne({ _id: id });

    res.json({ success: true, message: 'Order removed from history' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, message: 'Server error deleting order' });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderDetail,
  cancelOrder,
  deleteOrder
};
