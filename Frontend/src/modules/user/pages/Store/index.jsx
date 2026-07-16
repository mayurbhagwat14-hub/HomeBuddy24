import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiFilter, FiMapPin } from 'react-icons/fi';
import storeService from '../../../../services/storeService';
import { useStoreCart } from '../../../../context/StoreCartContext';
import { useCity } from '../../../../context/CityContext';
import PageTransition from '../../components/common/PageTransition';

const Store = () => {
  const navigate = useNavigate();
  const { currentCity } = useCity();
  const { getItemCount } = useStoreCart();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories on first load
      if (categories.length === 0) {
        const catRes = await storeService.getCategories();
        if (catRes.success) {
          setCategories(['All', ...catRes.categories]);
        }
      }

      // Fetch products
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchQuery) params.search = searchQuery;
      
      const prodRes = await storeService.getProducts(params);
      if (prodRes.success) {
        setProducts(prodRes.products);
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-teal-600 px-4 pt-12 pb-6 rounded-b-[30px] shadow-lg sticky top-0 z-20">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col text-white">
              <span className="text-sm opacity-80 flex items-center gap-1">
                <FiMapPin size={14} /> Delivering to
              </span>
              <span className="font-semibold">{currentCity?.name || 'Select City'}</span>
            </div>
            <button 
              onClick={() => navigate('/user/store/cart')}
              className="relative p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <FiShoppingCart size={22} />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-teal-600">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-300 transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors">
              <FiSearch size={18} />
            </button>
          </form>
        </div>

        {/* Categories */}
        <div className="px-4 mt-6">
          <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="px-4 mt-6">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-gray-800">Available Products</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white rounded-2xl p-3 animate-pulse h-64 border border-gray-100"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-100 mt-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="text-gray-300" size={32} />
              </div>
              <h3 className="text-gray-800 font-bold text-lg mb-1">No products found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  onClick={() => navigate(`/user/store/product/${product._id}`)}
                  className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-3 group">
                    <img 
                      src={product.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg shadow-sm text-teal-700">
                      {product.category}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug flex-1">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-teal-600">₹{product.price}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/store/product/${product._id}`);
                        }}
                        className="h-8 w-8 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-teal-600 transition-colors shadow-sm"
                      >
                        <FiShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Store;
