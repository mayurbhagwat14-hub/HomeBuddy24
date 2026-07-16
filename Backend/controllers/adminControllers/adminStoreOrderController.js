const StoreOrder = require('../../models/StoreOrder');

// Get Store Order Statistics
exports.getStoreOrderStats = async (req, res) => {
  try {
    const totalOrders = await StoreOrder.countDocuments();
    const deliveredOrders = await StoreOrder.find({ status: 'delivered' });
    
    let totalRevenue = 0;

    deliveredOrders.forEach(order => {
      totalRevenue += order.total_amount || 0;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        deliveredCount: deliveredOrders.length
      }
    });
  } catch (error) {
    console.error('Error fetching store order stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get all Store Orders with Pagination and Filtering
exports.getStoreOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    const orders = await StoreOrder.find(query)
      .populate('user_id', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await StoreOrder.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching store orders:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await StoreOrder.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date();
      order.cancellationReason = 'Cancelled by Admin';
      
      // Restore stock
      const StoreProduct = require('../../models/StoreProduct');
      const product = await StoreProduct.findById(order.product_id);
      if (product) {
        product.stock_qty += order.quantity;
        await product.save();
      }
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error updating order' });
  }
};
