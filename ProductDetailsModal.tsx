import React, { useState } from 'react';
import { X, Star, ShoppingCart, MessageSquare, ShieldAlert, CheckCircle, Plus, Minus } from 'lucide-react';
import { Product, Category, User } from '../types';

interface ProductDetailsModalProps {
  product: Product;
  categories: Category[];
  currentUser: User | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onAddReview: (productId: number, rating: number, comment: string) => Promise<void>;
}

export default function ProductDetailsModal({
  product,
  categories,
  currentUser,
  onClose,
  onAddToCart,
  onAddReview,
}: ProductDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const categoryName = categories.find(c => c.id === product.category_id)?.category_name || 'General';
  const finalPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setReviewError('You must be logged in to leave a review.');
      return;
    }
    if (!comment.trim()) {
      setReviewError('Please write some review comment.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      await onAddReview(product.id, rating, comment);
      setReviewSuccess(true);
      setComment('');
      setRating(5);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" id="details-modal">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-full transition shadow-sm"
          id="close-details-btn"
        >
          <X size={18} />
        </button>

        {/* Product Image Column */}
        <div className="w-full md:w-1/2 bg-slate-50 p-6 flex items-center justify-center border-r border-slate-100">
          <div className="relative w-full aspect-square max-w-sm rounded-xl overflow-hidden bg-white shadow-inner flex items-center justify-center">
            <img
              src={product.image}
              alt={product.product_name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-[11px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow">
                {product.discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Content Column */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
          <div>
            {/* Category / Name */}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              {categoryName}
            </span>
            <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">
              {product.product_name}
            </h2>

            {/* Price & Rating Summary */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-950">
                  ${finalPrice.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span className="text-sm text-slate-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="h-4 w-[1px] bg-slate-200"></div>
              <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                <Star size={13} fill="currentColor" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviews?.length || 0} reviews)</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Specifications */}
            {product.specifications && (
              <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Specifications
                </h4>
                <div className="text-xs text-slate-600 space-y-1">
                  {product.specifications.split(';').map((spec, idx) => (
                    <div key={idx} className="flex border-b border-slate-100/60 py-1 last:border-0">
                      <span className="text-slate-500 font-medium">{spec.split(':')[0]}:</span>
                      <span className="text-slate-700 font-semibold ml-1">{spec.split(':')[1] || ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock State */}
            <div className="mb-6 flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  In Stock ({product.stock} left)
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <div>
            {/* Add to Cart Actions */}
            {product.stock > 0 ? (
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white h-10 shadow-sm">
                  <button
                    onClick={handleDecrement}
                    className="px-3 hover:bg-slate-50 text-slate-600 active:bg-slate-100 h-full transition"
                    id="qty-decrement-btn"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 font-bold text-sm text-slate-800 w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="px-3 hover:bg-slate-50 text-slate-600 active:bg-slate-100 h-full transition"
                    id="qty-increment-btn"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-lg text-sm font-bold tracking-wide transition shadow-md shadow-indigo-600/10"
                  id="add-to-cart-large-btn"
                >
                  <ShoppingCart size={16} />
                  <span>Add to Cart (${(finalPrice * quantity).toFixed(2)})</span>
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-lg text-sm font-bold tracking-wide cursor-not-allowed mb-6"
              >
                Product Sold Out
              </button>
            )}

            {/* REVIEWS SECTION */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-display font-bold text-base text-slate-900 mb-4 flex items-center space-x-2">
                <MessageSquare size={16} />
                <span>Customer Reviews</span>
              </h3>

              {/* Reviews List */}
              <div className="space-y-3 max-h-[180px] overflow-y-auto mb-4 pr-1">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700">@{rev.username}</span>
                        <div className="flex items-center space-x-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              fill={i < Math.floor(rev.rating) ? 'currentColor' : 'none'}
                              className={i < Math.floor(rev.rating) ? 'text-amber-500' : 'text-slate-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{rev.comment}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to review this product!</p>
                )}
              </div>

              {/* Add Review Form */}
              {currentUser ? (
                <form onSubmit={handleReviewSubmit} className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                  <span className="text-xs font-bold text-slate-700 block mb-2">Leave a Review</span>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-slate-500">Your Rating:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-amber-500 hover:scale-110 transition"
                        >
                          <Star size={16} fill={star <= rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={2}
                      placeholder="Share your thoughts about this product..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="mt-1.5 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-1 px-3 rounded-md text-xs transition shadow-sm shadow-indigo-600/10"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                  {reviewError && (
                    <span className="text-[10px] text-rose-500 mt-1 flex items-center">
                      <ShieldAlert size={10} className="mr-1" /> {reviewError}
                    </span>
                  )}
                  {reviewSuccess && (
                    <span className="text-[10px] text-emerald-600 mt-1 flex items-center">
                      <CheckCircle size={10} className="mr-1" /> Review submitted successfully!
                    </span>
                  )}
                </form>
              ) : (
                <div className="bg-amber-50 border border-amber-100/60 rounded-xl p-3 text-center">
                  <p className="text-xs text-amber-800 font-medium">
                    Please log in to share your experience with this product.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
