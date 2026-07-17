import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, MapPin, CreditCard, ShoppingBag, Truck } from 'lucide-react';
import { CartItemWithProduct, User } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItemWithProduct[];
  currentUser: User | null;
  appliedCoupon: { code: string; discountPercent: number; type: 'percent' | 'fixed' } | null;
  onPlaceOrder: (shippingAddress: string, paymentMethod: string, totalAmount: number) => Promise<void>;
  onOpenAuth: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  appliedCoupon,
  onPlaceOrder,
  onOpenAuth,
}: CheckoutModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Autofill from current user profile
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.username);
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  // Calculate pricing
  const subtotal = cartItems.reduce((sum, item) => {
    const finalProductPrice = item.product.discount > 0 ? item.product.price * (1 - item.product.discount / 100) : item.product.price;
    return sum + finalProductPrice * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent / 100) : 0;
  const shippingFee = subtotal > 150 || (appliedCoupon && appliedCoupon.code === 'FREESHIP') ? 0 : 9.99;
  const total = subtotal - discountAmount + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please log in to complete checkout.');
      onOpenAuth();
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill in all shipping details.');
      return;
    }

    if (paymentMethod === 'Credit Card') {
      if (!cardNumber || !expiry || !cvv) {
        setError('Please fill in card details.');
        return;
      }
    }

    setIsSubmitting(true);
    setError('');

    try {
      const fullShippingDetails = `Name: ${fullName}, Phone: ${phone}, Address: ${address}`;
      await onPlaceOrder(fullShippingDetails, paymentMethod, total);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during order processing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" id="checkout-modal">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl relative border border-slate-100 flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Header (Absolute elements or layout) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 rounded-full transition"
          id="close-checkout-btn"
        >
          <X size={18} />
        </button>

        {/* Left Side: Order Placement Form */}
        <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto">
          <h2 className="font-display font-bold text-xl text-slate-900 mb-6 flex items-center space-x-2">
            <Truck size={20} className="text-indigo-600" />
            <span>Shipping & Payment Details</span>
          </h2>

          {!currentUser ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center space-y-3">
              <p className="text-sm text-amber-800 font-medium">
                You must be logged in to proceed with checking out.
              </p>
              <button
                onClick={() => {
                  onOpenAuth();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Log In or Register
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" id="checkout-form">
              {/* Shipping Sub-section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <MapPin size={12} />
                  <span>1. Delivery Address</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Receiver's Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Complete Address</label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-none"
                    placeholder="Street, City, State, ZIP code"
                  />
                </div>
              </div>

              {/* Payment Sub-section */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <CreditCard size={12} />
                  <span>2. Payment Method</span>
                </h3>

                <div className="flex space-x-3">
                  {['Credit Card', 'PayPal', 'Cash on Delivery'].map((method) => (
                    <label
                      key={method}
                      className={`flex-1 flex items-center justify-center p-2.5 border rounded-xl cursor-pointer text-xs font-semibold transition ${
                        paymentMethod === method
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="sr-only"
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'Credit Card' && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Card Number</label>
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">CVV</label>
                        <input
                          type="password"
                          placeholder="***"
                          maxLength={3}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-xs text-rose-500 font-semibold bg-rose-50 border border-rose-100 rounded-lg p-2.5">
                  {error}
                </div>
              )}

              {/* Order Confirmation button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-bold tracking-wide transition shadow-lg mt-6 shadow-indigo-600/10"
                id="confirm-checkout-btn"
              >
                <span>{isSubmitting ? 'Processing Order...' : `Confirm & Place Order (${paymentMethod === 'Cash on Delivery' ? 'Pay on Delivery' : 'Pay'} $${total.toFixed(2)})`}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Order Summary Side panel */}
        <div className="w-full md:w-2/5 bg-slate-50 border-l border-slate-100 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 mb-4 flex items-center space-x-2">
              <ShoppingBag size={18} />
              <span>Order Summary</span>
            </h3>

            {/* Itemized summary */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 mb-6">
              {cartItems.map((item) => {
                const finalProductPrice = item.product.discount > 0 ? item.product.price * (1 - item.product.discount / 100) : item.product.price;
                return (
                  <div key={item.id} className="flex items-center space-x-3 text-xs">
                    <img src={item.product.image} alt={item.product.product_name} referrerPolicy="no-referrer" className="w-10 h-10 rounded object-cover border border-slate-200/50 bg-white" />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-800 block truncate">{item.product.product_name}</span>
                      <span className="text-slate-500 text-[10px]">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-900">${(finalProductPrice * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-slate-200/80 pt-4 text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount ({appliedCoupon?.code})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-slate-900">
                {shippingFee === 0 ? <strong className="text-indigo-600 font-bold">FREE</strong> : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Bill</span>
              <span className="text-lg text-indigo-600 font-extrabold">${total.toFixed(2)}</span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200/60 flex items-start space-x-2 mt-4 text-[10px] font-normal leading-relaxed text-slate-500">
              <ShieldCheck size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />
              <span>Your payment credentials are fully encrypted and securely tokenized. Standard consumer rights protections apply to your purchase.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
