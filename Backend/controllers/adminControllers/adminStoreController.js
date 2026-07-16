const StoreProduct = require('../../models/StoreProduct');

/**
 * Get all store products (with filters) for admin
 */
const getAllProducts = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
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
    console.error('Error getting store products for admin:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

/**
 * Get product by ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await StoreProduct.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('Error getting product details:', error);
    res.status(500).json({ success: false, message: 'Server error fetching product' });
  }
};

/**
 * Create a new product
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock_qty, images, status } = req.body;

    const product = new StoreProduct({
      name,
      description,
      category,
      price,
      stock_qty,
      images,
      status: status || 'active'
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server error creating product' });
  }
};

/**
 * Update an existing product
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock_qty, images, status } = req.body;

    const product = await StoreProduct.findByIdAndUpdate(
      id,
      {
        $set: {
          name, description, category, price, stock_qty, images, status
        }
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

/**
 * Delete a product
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await StoreProduct.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
