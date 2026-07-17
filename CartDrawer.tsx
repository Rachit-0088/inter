import React, { useState } from 'react';
import { X, Trash2, Tag, Percent, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { CartItemWithProduct } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItemWithProduct[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: (appliedCoupon: { code: string; discountPercent: number; type: 'percent' | 'fixed' } | null) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number; type: 'percent' | 'fixed' } | null>(null);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  // Calculate prices
  const subtotal = cartItems.reduce((sum, item) => {
    const finalProductPrice = item.product.discount > 0 ? item.product.price * (1 - item.product.discount / 100) : item.product.price;
    return sum + finalProductPrice * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent / 100) : 0;
  const shippingFee = subtotal > 150 || (appliedCoupon && appliedCoupon.code === 'FREESHIP') ? 0 : 9.99;
  const total = subtotal - discountAmount + shippingFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');

    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'SAVE10') {
      setAppliedCoupon({ code: 'SAVE10', discountPercent: 10, type: 'percent' });
      setCouponCode('');
    } else if (cleanCode === 'AURA50') {
      setAppliedCoupon({ code: 'AURA50', discountPercent: 50, type: 'percent' });
      setCouponCode('');
    } else if (cleanCode === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', discountPercent: 0, type: 'fixed' });
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code. Try SAVE10, FREESHIP, or AURA50.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-slate-900 flex items-center space-x-2">
              <span>Shopping Cart</span>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-sans">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items
              </span>
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition"
              id="close-cart-btn"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => {
                const finalProductPrice = item.product.discount > 0 ? item.product.price * (1 - item.product.discount / 100) : item.product.price;
                return (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-3 bg-slate-50 rounded-xl border border-slate-100"
                    id={`cart-item-${item.id}`}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-slate-200/60 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={item.product.image}
                        alt={item.product.product_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {item.product.product_name}
                      </h4>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-xs font-bold text-slate-900">
                          ${finalProductPrice.toFixed(2)}
                        </span>
                        {item.product.discount > 0 && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ${item.product.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white h-7">
                          <button
                            onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                            className="px-2 text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition h-full text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-700 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                            className="px-2 text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition h-full text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      onClick={() => onRemoveItem(item.product_id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition"
                      id={`remove-cart-item-${item.product_id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-slate-400 italic">Your cart is currently empty.</p>
              </div>
            )}
          </div>

          {/* Pricing & Checkout Summary Box */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
            {/* Coupon Application Form */}
            {cartItems.length > 0 && (
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-indigo-50 text-indigo-800 rounded-lg p-2.5 text-xs font-semibold border border-indigo-100">
                    <span className="flex items-center">
                      <Ticket size={14} className="mr-1.5 text-indigo-600" />
                      Coupon Applied: <strong className="ml-1 text-indigo-900">{appliedCoupon.code}</strong>
                      {appliedCoupon.discountPercent > 0 && ` (${appliedCoupon.discountPercent}% OFF)`}
                    </span>
                    <button onClick={handleRemoveCoupon} className="text-indigo-600 hover:text-indigo-900 text-[10px] font-bold underline ml-2">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Promo Code (SAVE10, AURA50)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 uppercase placeholder-slate-400 font-medium transition"
                    />
                    <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/10">
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[10px] text-rose-500 mt-1 font-medium">{couponError}</p>
                )}
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-2 text-xs font-medium text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span className="flex items-center"><Percent size={11} className="mr-1" /> Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-slate-900">
                  {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-[9px] text-slate-400 italic">Free shipping for orders over $150.00</p>
              )}
              <div className="border-t border-slate-200/80 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Estimated Total</span>
                <span className="text-base text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Trigger */}
            {cartItems.length > 0 ? (
              <button
                onClick={() => onCheckout(appliedCoupon)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold tracking-wide transition shadow-md shadow-indigo-600/15"
                id="cart-checkout-btn"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2.5 bg-slate-200 text-slate-400 rounded-lg text-sm font-bold tracking-wide cursor-not-allowed"
              >
                Cart is Empty
              </button>
            )}

            <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400">
              <ShieldCheck size={12} className="text-indigo-500" />
              <span>Secure Checkout & Encryption Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
