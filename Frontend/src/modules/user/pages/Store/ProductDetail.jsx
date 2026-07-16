import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi';
import storeService from '../../../../services/storeService';
import { useStoreCart } from '../../../../context/StoreCartContext';
import toast from 'react-hot-toast';
import PageTransition from '../../components/common/PageTransition';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, updateCartItem, getItemCount } = useStoreCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await storeService.getProductDetails(id);
        if (res.success) {
          setProduct(res.product);
          // Check if already in cart
          if (cart?.items) {
            const existingItem = cart.items.find(item => item.productId === id);
            if (existingItem) {
              setQuantity(existingItem.quantity);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, cart]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    const success = await updateCartItem(product._id, quantity);
    if (success) {
      toast.success('Added to cart');
    } else {
      toast.error('Failed to update cart');
    }
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await handleAddToCart();
    navigate('/user/store/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="w-full h-80 bg-gray-200 animate-pulse rounded-b-[40px]"></div>
        <div className="p-6 space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="space-y-2 mt-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 text-teal-600 font-medium">Go Back</button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock_qty <= 0;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Image Header */}
        <div className="relative h-96 w-full bg-white rounded-b-[40px] shadow-sm overflow-hidden">
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-12 left-4 z-10 w-12 h-12 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md text-gray-800 hover:bg-white transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          
          <button 
            onClick={() => navigate('/user/store/cart')}
            className="absolute top-12 right-4 z-10 w-12 h-12 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md text-gray-800 hover:bg-white transition-colors"
          >
            <FiShoppingCart size={22} />
            {getItemCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                {getItemCount()}
              </span>
            )}
          </button>

          <img 
            src={product.images?.[0] || 'https://via.placeholder.com/600'} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-8 -mt-6 relative z-10 bg-gray-50 rounded-t-[40px]">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {product.category}
            </div>
            {isOutOfStock && (
              <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Out of Stock
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mt-3 leading-tight">{product.name}</h1>
          
          <div className="mt-4 flex items-center gap-4">
            <span className="text-3xl font-black text-teal-600">₹{product.price}</span>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-sm text-gray-500">
              Sold by: <span className="font-semibold text-gray-800">{product.vendor_id?.businessName || product.vendor_id?.name}</span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'No description available for this product.'}
            </p>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-30">
          {!isOutOfStock ? (
            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between bg-gray-100 rounded-2xl p-1 w-32">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-600 hover:text-teal-600"
                >
                  <FiMinus />
                </button>
                <span className="font-bold text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                  className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-600 hover:text-teal-600"
                >
                  <FiPlus />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex-1 flex gap-2">
                <button 
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 py-4 bg-teal-50 text-teal-700 font-bold rounded-2xl hover:bg-teal-100 transition-colors text-sm"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/30 text-sm flex items-center justify-center gap-1"
                >
                  Buy Now <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <button disabled className="w-full py-4 bg-gray-200 text-gray-500 font-bold rounded-2xl">
              Currently Out of Stock
            </button>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ProductDetail;
