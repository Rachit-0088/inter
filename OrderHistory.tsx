import React from 'react';
import { ShoppingBag, Calendar, MapPin, CreditCard, Clock, CheckCircle, Package, ArrowLeft, RefreshCw } from 'lucide-react';
import { OrderWithItems, User } from '../types';

interface OrderHistoryProps {
  orders: OrderWithItems[];
  currentUser: User | null;
  onBackToHome: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function OrderHistory({
  orders,
  currentUser,
  onBackToHome,
  onRefresh,
  isLoading,
}: OrderHistoryProps) {

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Processing':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Shipped':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'Delivered':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock size={12} className="mr-1 animate-pulse" />;
      case 'Delivered':
        return <CheckCircle size={12} className="mr-1" />;
      default:
        return <Package size={12} className="mr-1" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="order-history-view">
      {/* Back & Refresh Headers */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          id="orders-back-home-btn"
        >
          <ArrowLeft size={14} />
          <span>Back to Shopping</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
          id="orders-refresh-btn"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh History</span>
        </button>
      </div>

      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-indigo-900 flex items-center space-x-2">
          <ShoppingBag size={24} />
          <span>My Order History</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Review all your active and historical orders. Statuses are updated in real-time.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-3">
          <RefreshCw size={24} className="animate-spin text-indigo-600" />
          <p className="text-xs text-slate-400 italic">Retrieving order database...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="font-sans font-bold text-slate-800 text-sm">No orders found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              You haven't placed any orders yet. Add items to your cart and check out to view them here.
            </p>
          </div>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              id={`order-block-${order.id}`}
            >
              {/* Order Block Header info */}
              <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div className="grid grid-cols-2 sm:flex sm:items-center sm:space-x-6 gap-2">
                  <div>
                    <span className="text-slate-400 block font-medium">Order ID</span>
                    <strong className="text-slate-800 font-mono">#ORD-{(1000 + order.id)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Date Placed</span>
                    <strong className="text-slate-800 flex items-center">
                      <Calendar size={12} className="mr-1 text-slate-400" />
                      {new Date(order.order_date).toLocaleDateString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Total Amount</span>
                    <strong className="text-indigo-600 font-extrabold">${order.total_amount.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Status badge */}
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Details & Items Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Item list */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Purchased Items</h4>
                  <div className="space-y-3">
                    {order.items && order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'}
                          alt={item.product_name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded object-cover bg-slate-50 border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-slate-800 block truncate">{item.product_name}</span>
                          <span className="text-slate-500 text-[10px]">Price: ${item.price.toFixed(2)} &bull; Quantity: {item.quantity}</span>
                        </div>
                        <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment summary */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/50 space-y-4 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-700 flex items-center space-x-1 mb-1.5">
                      <MapPin size={12} className="text-slate-400" />
                      <span>Shipping Address</span>
                    </h5>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {order.shipping_address}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <h5 className="font-bold text-slate-700 flex items-center space-x-1 mb-1.5">
                      <CreditCard size={12} className="text-slate-400" />
                      <span>Payment Method</span>
                    </h5>
                    <p className="text-slate-600 font-medium">
                      {order.payment_method}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
