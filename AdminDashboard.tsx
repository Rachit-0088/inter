import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBag, FolderKanban, ClipboardList, Users, Plus, Edit, Trash2, TrendingUp, DollarSign, ShoppingCart, UserCheck, ArrowLeft, RefreshCw, Eye } from 'lucide-react';
import { Product, Category, User, OrderWithItems } from '../types';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  users: User[];
  orders: OrderWithItems[];
  onAddProduct: (prod: Omit<Product, 'id' | 'rating' | 'reviews'>) => Promise<void>;
  onEditProduct: (id: number, prod: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onAddCategory: (name: string) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
  onUpdateOrderStatus: (orderId: number, status: string) => Promise<void>;
  onBackToHome: () => void;
  isLoading: boolean;
}

export default function AdminDashboard({
  products,
  categories,
  users,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
  onUpdateOrderStatus,
  onBackToHome,
  isLoading,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'users'>('overview');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields for Products
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState(categories[0]?.id || 1);
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [pImage, setPImage] = useState('');
  const [pDiscount, setPDiscount] = useState('0');
  const [pSpecs, setPSpecs] = useState('');

  // Form Fields for Categories
  const [newCatName, setNewCatName] = useState('');

  // Calculated Stats
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const activeProductsCount = products.length;
  const customersCount = users.filter(u => !u.isAdmin).length;

  const openAddForm = () => {
    setEditingProduct(null);
    setPName('');
    setPCategory(categories[0]?.id || 1);
    setPDesc('');
    setPPrice('');
    setPStock('');
    setPImage('');
    setPDiscount('0');
    setPSpecs('Display: ; Processor: ; Memory: ; Battery: ');
    setShowProductForm(true);
  };

  const openEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.product_name);
    setPCategory(prod.category_id);
    setPDesc(prod.description);
    setPPrice(prod.price.toString());
    setPStock(prod.stock.toString());
    setPImage(prod.image);
    setPDiscount(prod.discount.toString());
    setPSpecs(prod.specifications || '');
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productPayload = {
      product_name: pName,
      category_id: Number(pCategory),
      description: pDesc,
      price: parseFloat(pPrice) || 0,
      stock: parseInt(pStock, 10) || 0,
      image: pImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60',
      discount: parseInt(pDiscount, 10) || 0,
      specifications: pSpecs,
    };

    try {
      if (editingProduct) {
        await onEditProduct(editingProduct.id, productPayload);
      } else {
        await onAddProduct(productPayload);
      }
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (err) {
      alert('Error saving product.');
    }
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await onAddCategory(newCatName.trim());
      setNewCatName('');
    } catch (err) {
      alert('Error adding category.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin-dashboard-container">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          id="admin-back-btn"
        >
          <ArrowLeft size={14} />
          <span>Exit Administrative Controls</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-indigo-900 tracking-tight flex items-center space-x-3">
            <ShieldCheckIcon />
            <span>Store Administration</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Real-time management panel for inventories, orders, classifications, and system operations.
          </p>
        </div>
        <div className="flex space-x-2">
          {activeTab === 'products' && (
            <button
              onClick={openAddForm}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-md shadow-indigo-600/10 transition"
              id="admin-add-product-btn"
            >
              <Plus size={14} />
              <span>Add New Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto space-x-1">
        {[
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={14} /> },
          { id: 'products', label: 'Products', icon: <ShoppingBag size={14} /> },
          { id: 'categories', label: 'Categories', icon: <FolderKanban size={14} /> },
          { id: 'orders', label: 'Customer Orders', icon: <ClipboardList size={14} /> },
          { id: 'users', label: 'User Directory', icon: <Users size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setShowProductForm(false);
            }}
            className={`flex items-center space-x-1.5 px-4 py-2.5 border-b-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-200'
            }`}
            id={`admin-tab-${tab.id}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE TAB */}
      {isLoading ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center space-y-3">
          <RefreshCw size={24} className="animate-spin text-indigo-600" />
          <p className="text-xs text-slate-400 italic">Syncing administrative database...</p>
        </div>
      ) : activeTab === 'overview' ? (
        /* TAB 1: OVERVIEW ANALYTICS */
        <div className="space-y-8" id="tab-overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={<DollarSign size={20} />} trend="Excludes cancelled orders" bg="bg-indigo-600 shadow-md shadow-indigo-600/10" />
            <StatCard title="Store Orders" value={orders.length.toString()} icon={<ShoppingCart size={20} />} trend={`${pendingOrdersCount} pending response`} bg="bg-indigo-500 shadow-md shadow-indigo-500/10" />
            <StatCard title="Listed Products" value={activeProductsCount.toString()} icon={<ShoppingBag size={20} />} trend="Across 4 categories" bg="bg-indigo-400 shadow-md shadow-indigo-400/10" />
            <StatCard title="Registered Customers" value={customersCount.toString()} icon={<Users size={20} />} trend="Durable database" bg="bg-slate-700 shadow-md shadow-slate-700/10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Orders List */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-display font-bold text-sm text-slate-900 mb-4 flex items-center space-x-2">
                <ClipboardList size={16} />
                <span>Recent Activities & Orders</span>
              </h3>
              <div className="space-y-4">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center justify-between text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-slate-800 font-mono block">#ORD-{(1000 + o.id)}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">By @{o.username} &bull; {new Date(o.order_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <strong className="text-slate-950">${o.total_amount.toFixed(2)}</strong>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No orders registered yet.</p>
                )}
              </div>
            </div>

            {/* Quick Inventory Stock Alert */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-display font-bold text-sm text-slate-900 mb-4 flex items-center space-x-2">
                <TrendingUp size={16} />
                <span>Low Stock Alerts</span>
              </h3>
              <div className="space-y-4">
                {products
                  .filter(p => p.stock <= 10)
                  .map(p => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[150px]">{p.product_name}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        p.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.stock} units
                      </span>
                    </div>
                  ))}
                {products.filter(p => p.stock <= 10).length === 0 && (
                  <p className="text-xs text-slate-400 italic py-4 text-center">All inventory stocks healthy!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'products' ? (
        /* TAB 2: PRODUCTS CATALOG MANAGEMENT */
        <div id="tab-products">
          {showProductForm ? (
            /* PRODUCT CREATE OR EDIT FORM */
            <form onSubmit={handleProductSubmit} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8 space-y-6 max-w-2xl mx-auto">
              <h3 className="font-display font-bold text-lg text-slate-900">
                {editingProduct ? `Edit Product: ${editingProduct.product_name}` : 'Create New Product'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Classification Category</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.category_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com..."
                    value={pImage}
                    onChange={(e) => setPImage(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    max="99"
                    value={pDiscount}
                    onChange={(e) => setPDiscount(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brief Description</label>
                <textarea
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specifications (Semicolon separated list, e.g. Key: Value; Key2: Value2)</label>
                <textarea
                  rows={2}
                  value={pSpecs}
                  onChange={(e) => setPSpecs(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-200/50">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/10"
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* PRODUCTS LIST TABLE */
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    <th className="px-6 py-3.5">Product</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Stock</th>
                    <th className="px-6 py-3.5">Discount</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {products.map(p => {
                    const catName = categories.find(c => c.id === p.category_id)?.category_name || 'General';
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <img src={p.image} alt={p.product_name} referrerPolicy="no-referrer" className="w-9 h-9 rounded object-cover border border-slate-200/50" />
                          <span className="font-bold text-slate-800 truncate max-w-[180px]">{p.product_name}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{catName}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">${p.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                            p.stock === 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-4 text-rose-600 font-bold">{p.discount > 0 ? `${p.discount}% OFF` : '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex space-x-1">
                            <button
                              onClick={() => openEditForm(p)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${p.product_name}?`)) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'categories' ? (
        /* TAB 3: CATEGORY CLASSIFICATIONS */
        <div className="max-w-md mx-auto grid grid-cols-1 gap-6" id="tab-categories">
          {/* Add Category Form */}
          <form onSubmit={handleAddCategorySubmit} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex space-x-2">
            <input
              type="text"
              placeholder="Classification Category (e.g. Toys)"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/10">
              Create
            </button>
          </form>

          {/* List Classifications */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
              Listed Categories
            </div>
            <div className="divide-y divide-slate-50 text-xs">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-slate-50/40 transition">
                  <span className="font-semibold text-slate-800">{cat.category_name}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Delete category "${cat.category_name}"? All products inside this category will remain listed but lose category details.`)) {
                        onDeleteCategory(cat.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        /* TAB 4: CUSTOMER ORDERS PROCESSING */
        <div className="space-y-4" id="tab-orders">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id={`admin-order-block-${order.id}`}>
              {/* Order administrative header */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <strong className="text-slate-800 font-mono">#ORD-{(1000 + order.id)}</strong>
                    <span className="text-slate-400">By</span>
                    <strong className="text-slate-800">@{order.username}</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{new Date(order.order_date).toLocaleString()}</span>
                </div>

                {/* State Controls */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 mr-1.5">Update Status:</span>
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                    className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none font-semibold text-slate-700"
                  >
                    {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Summary & Delivery targets */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="md:col-span-2 space-y-3">
                  <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Ordered Products</h5>
                  <div className="space-y-2">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img src={item.image} alt={item.product_name} referrerPolicy="no-referrer" className="w-9 h-9 rounded object-cover border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-slate-800 truncate block">{item.product_name}</span>
                          <span className="text-slate-500 text-[10px]">Price: ${item.price.toFixed(2)} &bull; Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/60 space-y-3">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] block mb-1">Shipping Target</span>
                    <p className="text-slate-700 leading-normal font-medium">{order.shipping_address}</p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5">
                    <span className="text-slate-400 font-bold uppercase text-[9px] block mb-0.5">Method & Total</span>
                    <p className="text-slate-700 font-medium">{order.payment_method} &bull; <strong className="text-indigo-600 font-extrabold">${order.total_amount.toFixed(2)}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-xs text-slate-400 italic py-12 text-center bg-white rounded-2xl border border-slate-100">No orders placed on this platform yet.</p>
          )}
        </div>
      ) : (
        /* TAB 5: REGISTERED USERS */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="tab-users">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                <th className="px-6 py-3.5">User Details</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5">Roles</th>
                <th className="px-6 py-3.5">Date Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow shadow-indigo-600/10">
                      {u.username[0]}
                    </div>
                    <span className="font-bold text-slate-800">@{u.username}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                  <td className="px-6 py-4 text-slate-600">{u.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      u.isAdmin ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.isAdmin ? 'Administrator' : 'Customer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Sub components helper
function StatCard({ title, value, icon, trend, bg }: { title: string, value: string, icon: React.ReactNode, trend: string, bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-center space-x-4">
      <div className={`w-10 h-10 rounded-lg text-white flex items-center justify-center ${bg}`}>
        {icon}
      </div>
      <div>
        <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">{title}</span>
        <strong className="text-xl text-slate-950 block mt-0.5">{value}</strong>
        <span className="text-[10px] text-slate-500 mt-1 block font-medium">{trend}</span>
      </div>
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <div className="p-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/10">
      <LayoutDashboard size={20} />
    </div>
  );
}
