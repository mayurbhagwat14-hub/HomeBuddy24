import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import adminStoreService from '../../../../services/adminStoreService';
import toast from 'react-hot-toast';

const StoreProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminStoreService.getAllProducts({ status: activeTab !== 'all' ? activeTab : undefined });
      if (res.success) {
        setProducts(res.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await adminStoreService.deleteProduct(id);
      if (res.success) {
        toast.success('Product deleted');
        fetchProducts();
      }
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Products</h1>
          <p className="text-gray-500">Manage products for the marketplace</p>
        </div>
        <button
          onClick={() => navigate('/admin/store/products/add')}
          className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <FiPlus /> Add Product
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {['active', 'inactive', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 font-medium capitalize transition-all ${
              activeTab === tab
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => <div key={n} className="h-32 bg-white rounded-xl animate-pulse"></div>)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FiPackage size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No products found</h3>
          <p className="text-gray-500">There are no {activeTab} products at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map(product => (
            <div key={product._id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-32 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                <img 
                  src={product.images?.[0] || 'https://via.placeholder.com/150'} 
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        Category: <span className="font-semibold text-gray-700">{product.category}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {product.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex gap-6">
                    <div>
                      <span className="text-xs text-gray-500 block">Price</span>
                      <span className="font-bold text-gray-900">₹{product.price}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Stock</span>
                      <span className="font-bold text-gray-900">{product.stock_qty}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                  <button 
                    onClick={() => navigate(`/admin/store/products/${product._id}/edit`)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product._id)}
                    className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreProducts;
