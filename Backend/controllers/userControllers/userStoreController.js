const StoreProduct = require('../../models/StoreProduct');
const StoreCart = require('../../models/StoreCart');

/**
 * Get active store products for users
 */
const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    
    // Only fetch ACTIVE products
    const query = { status: 'active' };

    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await StoreProduct.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StoreProduct.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching store products:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

/**
 * Get a single product details
 */
const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await StoreProduct.findOne({ _id: id, status: 'active' });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or not available' });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ success: false, message: 'Server error fetching product details' });
  }
};

/**
 * Get available product categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await StoreProduct.distinct('category', { status: 'active' });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
};

/**
 * Get User Cart
 */
const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    let cart = await StoreCart.findOne({ userId });

    if (!cart) {
      cart = await StoreCart.create({ userId, items: [] });
    }

    res.json({ success: true, cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: 'Server error fetching cart' });
  }
};

/**
 * Add or update item in cart
 */
const updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
    }

    const product = await StoreProduct.findOne({ _id: productId, status: 'active' });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or not available' });
    }

    if (product.stock_qty < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock_qty} items available in stock` });
    }

    let cart = await StoreCart.findOne({ userId });
    if (!cart) {
      cart = new StoreCart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = quantity;
      // Also update price and details just in case it changed
      cart.items[existingItemIndex].price = product.price;
      cart.items[existingItemIndex].name = product.name;
      cart.items[existingItemIndex].image = product.images?.[0] || null;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || null,
        price: product.price,
        quantity
      });
    }

    await cart.save();

    res.json({ success: true, cart, message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Server error updating cart' });
  }
};

/**
 * Remove item from cart
 */
const removeCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;

    const cart = await StoreCart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.json({ success: true, cart, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ success: false, message: 'Server error removing item from cart' });
  }
};

/**
 * Clear user cart
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await StoreCart.findOne({ userId });
    
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: 'Server error clearing cart' });
  }
};

module.exports = {
  getProducts,
  getProductDetails,
  getCategories,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
