import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, ShoppingBag, ShieldAlert, BadgeInfo, CheckCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderHistory from './components/OrderHistory';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import ProfileView from './components/ProfileView';
import { User, Category, Product, CartItemWithProduct, OrderWithItems } from './types';

export default function App() {
  // Core user auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation and views state
  const [currentView, setCurrentView] = useState<'home' | 'orders' | 'admin' | 'profile'>('home');

  // Database lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [users, setUsers] = useState<User[]>([]); // Admin only

  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Loading states
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  // Overlay / Modals states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number; type: 'percent' | 'fixed' } | null>(null);

  // Success / Notification feedback
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch Headers Helper
  const getAuthHeaders = () => {
    return currentUser ? { 'x-user-id': currentUser.id.toString() } : {};
  };

  // Trigger temporary floating notification
  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // --- API DATA FETCHERS ---

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      let url = '/api/products';
      const params = new URLSearchParams();
      if (selectedCategory !== null) {
        params.append('category', selectedCategory.toString());
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchCartItems = async () => {
    if (!currentUser) {
      setCartItems([]);
      return;
    }
    setIsLoadingCart(true);
    try {
      const res = await fetch('/api/cart', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setIsLoadingCart(false);
    }
  };

  const fetchOrders = async () => {
    if (!currentUser) return;
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/orders', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchUsers = async () => {
    if (!currentUser?.isAdmin) return;
    try {
      const res = await fetch('/api/users', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users directory:', err);
    }
  };

  // Sync state whenever filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  // Sync categories and user info on mount
  useEffect(() => {
    fetchCategories();
    if (currentUser) {
      fetchCartItems();
      fetchOrders();
      if (currentUser.isAdmin) {
        fetchUsers();
      }
    }
  }, [currentUser]);

  // --- CART MUTATIONS ---

  const handleAddToCart = async (product: Product, quantity: number) => {
    if (!currentUser) {
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ product_id: product.id, quantity })
      });

      if (res.ok) {
        fetchCartItems();
        triggerNotification(`Added ${quantity}x ${product.product_name} to cart.`);
      } else {
        const data = await res.json();
        triggerNotification(data.error || 'Failed to add item.', 'error');
      }
    } catch (err) {
      triggerNotification('Connection error while adding item to cart.', 'error');
    }
  };

  const handleUpdateCartQuantity = async (productId: number, quantity: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ product_id: productId, quantity })
      });

      if (res.ok) {
        fetchCartItems();
      } else {
        const data = await res.json();
        triggerNotification(data.error || 'Failed to update quantity.', 'error');
      }
    } catch (err) {
      triggerNotification('Connection error.', 'error');
    }
  };

  const handleRemoveCartItem = async (productId: number) => {
    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        fetchCartItems();
        triggerNotification('Removed item from shopping cart.');
      }
    } catch (err) {
      triggerNotification('Connection error.', 'error');
    }
  };

  // --- CHECKOUT & ORDERING ---

  const handlePlaceOrder = async (shippingAddress: string, paymentMethod: string, totalAmount: number) => {
    const itemsPayload = cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.discount > 0 ? item.product.price * (1 - item.product.discount / 100) : item.product.price
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          items: itemsPayload,
          total_amount: totalAmount
        })
      });

      if (res.ok) {
        triggerNotification('Order placed successfully! Thank you for your purchase.');
        setAppliedCoupon(null);
        fetchCartItems();
        fetchOrders();
        fetchProducts(); // Refresh stocks
        setCurrentView('orders');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Order placement failed.');
      }
    } catch (err: any) {
      throw err;
    }
  };

  // --- ADMIN MUTATIONS ---

  const handleAddProduct = async (productData: any) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(productData)
      });

      if (res.ok) {
        fetchProducts();
        triggerNotification('Product created successfully.');
      } else {
        const data = await res.json();
        triggerNotification(data.error || 'Failed to create product.', 'error');
      }
    } catch (err) {
      triggerNotification('Error creating product.', 'error');
    }
  };

  const handleEditProduct = async (id: number, productData: any) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(productData)
      });

      if (res.ok) {
        fetchProducts();
        triggerNotification('Product updated successfully.');
      } else {
        const data = await res.json();
        triggerNotification(data.error || 'Failed to update product.', 'error');
      }
    } catch (err) {
      triggerNotification('Error editing product.', 'error');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        fetchProducts();
        triggerNotification('Product deleted successfully.');
      } else {
        const data = await res.json();
        triggerNotification(data.error || 'Failed to delete product.', 'error');
      }
    } catch (err) {
      triggerNotification('Error deleting product.', 'error');
    }
  };

  const handleAddCategory = async (categoryName: string) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ category_name: categoryName })
      });

      if (res.ok) {
        fetchCategories();
        triggerNotification('Category created successfully.');
      } else {
        const data = await res.json();
        triggerNotification(data.error || 'Failed to create category.', 'error');
      }
    } catch (err) {
      triggerNotification('Error creating category.', 'error');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        fetchCategories();
        triggerNotification('Category deleted successfully.');
      } else {
        const data = await res.json();
        triggerNotification(data.error || 'Failed to delete category.', 'error');
      }
    } catch (err) {
      triggerNotification('Error deleting category.', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchOrders();
        triggerNotification(`Order status updated to ${status}.`);
      } else {
        const data = await res.json();
        triggerNotification(data.error || 'Failed to update order status.', 'error');
      }
    } catch (err) {
      triggerNotification('Error updating order status.', 'error');
    }
  };

  // --- REVIEWS MUTATIONS ---

  const handleAddReview = async (productId: number, rating: number, comment: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ rating, comment })
      });

      if (res.ok) {
        fetchProducts(); // Update rating scores in the local database lists
        const data = await res.json();
        setSelectedProduct(data); // Refresh the actively shown details modal
        triggerNotification('Thank you for sharing your review!');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      throw err;
    }
  };

  // --- AUTH ACTIONS ---

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    triggerNotification(`Logged in successfully. Welcome back, ${user.username}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCartItems([]);
    setOrders([]);
    localStorage.removeItem('user');
    setCurrentView('home');
    triggerNotification('Logged out successfully.');
  };

  const handleUpdateProfile = async (updatedFields: { email: string; phone: string; address: string }) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updatedFields)
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        triggerNotification('Profile credentials updated successfully.');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Profile update failed.');
      }
    } catch (err: any) {
      throw err;
    }
  };

  // Helper values
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans" id="app-root">
      {/* Floating alert notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold transition-all duration-300 animate-slide-in ${
            notification.type === 'success'
              ? 'bg-indigo-950 text-indigo-300 border-indigo-800 shadow-indigo-950/20'
              : 'bg-rose-950 text-rose-300 border-rose-900 shadow-rose-950/20'
          }`}
          id="toast-notification"
        >
          {notification.type === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartCount}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateTo={(view) => setCurrentView(view as any)}
        currentView={currentView}
        onOpenAuthModal={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-grow">
        {currentView === 'home' ? (
          /* VIEW 1: HOME CATALOG VIEW WITH HERO BANNER */
          <div id="home-view">
            {/* Hero banner section */}
            {!selectedCategory && !searchQuery && (
              <section className="bg-gradient-to-br from-indigo-950 to-slate-950 text-white py-16 px-4 md:px-8 border-b border-indigo-900/40 relative overflow-hidden mb-10 rounded-2xl shadow-sm mx-4 sm:mx-6 lg:mx-8 mt-6">
                {/* Visual decoration overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]"></div>
                
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between relative z-10 gap-8">
                  <div className="max-w-xl space-y-4">
                    <span className="inline-flex items-center space-x-1 bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
                      <Sparkles size={11} /> <span>Official Launch Offer</span>
                    </span>
                    <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight leading-none text-slate-100">
                      Unveiling the <br/>New Standard of Tech.
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                      Meticulously engineered products tailored for professionals, creators, and everyday innovators. Enjoy free delivery for purchases exceeding $150.00.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          const electronics = categories.find(c => c.category_name === 'Electronics');
                          if (electronics) setSelectedCategory(electronics.id);
                        }}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-900/35 transition active:scale-98"
                      >
                        <span>Explore Premium Series</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Banner Showcase Badge */}
                  <div className="hidden lg:block w-72 h-72 bg-indigo-950/25 rounded-3xl border border-indigo-900/30 p-6 shadow-inner flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase block mb-1">Weekly Spotlight</span>
                      <strong className="text-lg text-slate-100 font-display block">AcousticPure Wireless</strong>
                      <p className="text-xs text-indigo-200 mt-1">Noise cancelling Over-Ear studio headphones.</p>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-indigo-300 font-bold text-base">$254.99 <span className="text-[10px] text-slate-500 line-through">$299.99</span></span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-black border border-indigo-500/30">15% OFF</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Catalog list section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              {/* Filter feedback header */}
              {(selectedCategory !== null || searchQuery) && (
                <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="text-xs">
                    <span className="text-slate-400">Showing results for: </span>
                    {selectedCategory !== null && (
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded mr-2">
                        Category: {categories.find(c => c.id === selectedCategory)?.category_name}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                        Query: "{searchQuery}"
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 transition underline"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Grid lists */}
              {isLoadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-xl p-4 space-y-4 animate-pulse">
                      <div className="bg-slate-200 aspect-square rounded-lg"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-xl mx-auto flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-slate-800 text-sm">No matching products found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      We couldn't find anything matching your filters or search keywords. Try adjusting your query.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categories={categories}
                      onAddToCart={handleAddToCart}
                      onOpenDetails={setSelectedProduct}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : currentView === 'orders' ? (
          /* VIEW 2: ORDER HISTORY VIEW */
          <OrderHistory
            orders={orders}
            currentUser={currentUser}
            onBackToHome={() => setCurrentView('home')}
            onRefresh={fetchOrders}
            isLoading={isLoadingOrders}
          />
        ) : currentView === 'admin' ? (
          /* VIEW 3: ADMINISTRATIVE DASHBOARD */
          <AdminDashboard
            products={products}
            categories={categories}
            users={users}
            orders={orders}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onBackToHome={() => setCurrentView('home')}
            isLoading={isLoadingProducts || isLoadingOrders}
          />
        ) : currentView === 'profile' ? (
          /* VIEW 4: SECURE USER PROFILE VIEW */
          <ProfileView
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onBackToHome={() => setCurrentView('home')}
          />
        ) : null}
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-800 text-slate-300 text-xs py-12 border-t border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="font-display font-black text-indigo-400 text-base tracking-wider uppercase">AURA E-COMMERCE</span>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Meticulously designed, high-performance electronics and essentials. Built for modern builders.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Classification</h4>
            <div className="space-y-1.5 text-[11px]">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setCurrentView('home');
                  }}
                  className="block hover:text-indigo-400 transition text-left text-slate-400 hover:underline"
                >
                  {c.category_name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Demonstration</h4>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <span className="block">Academic Project</span>
              <span className="block">Backend: Express & Node</span>
              <span className="block">Frontend: React & Tailwind</span>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">Secure Verification</h4>
            <div className="flex items-center space-x-1.5 bg-slate-900/60 border border-slate-700 rounded-lg p-3 text-[10px] text-slate-400">
              <ShieldCheck size={16} className="text-indigo-400 flex-shrink-0" />
              <span>Durable JSON Relational Engine with active stock updates and security modules.</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-700/60 text-center text-slate-500 text-[11px]">
          &copy; {new Date().getFullYear()} Aura E-Commerce. Built to fulfill project requirements with premium user experiences.
        </div>
      </footer>

      {/* --- FLOATING OVERLAYS & MODALS --- */}

      {/* 1. Auth Login / Register Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* 2. Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          categories={categories}
          currentUser={currentUser}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onAddReview={handleAddReview}
        />
      )}

      {/* 3. Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={(applied) => {
          setAppliedCoupon(applied);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 4. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        appliedCoupon={appliedCoupon}
        onPlaceOrder={handlePlaceOrder}
        onOpenAuth={() => {
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
      />
    </div>
  );
}
