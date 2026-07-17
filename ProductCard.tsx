import React from 'react';
import { Star, ShoppingBag, Eye, Percent } from 'lucide-react';
import { Product, Category } from '../types';

interface ProductCardProps {
  product: Product;
  categories: Category[];
  onAddToCart: (product: Product, quantity: number) => void | Promise<void>;
  onOpenDetails: (product: Product) => void;
  key?: React.Key;
}

export default function ProductCard({
  product,
  categories,
  onAddToCart,
  onOpenDetails,
}: ProductCardProps) {
  const categoryName = categories.find(c => c.id === product.category_id)?.category_name || 'General';
  const finalPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

  return (
    <div
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
      id={`product-card-${product.id}`}
    >
      {/* Product Image & Badges */}
      <div className="relative pt-[100%] bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onOpenDetails(product)}>
        <img
          src={product.image}
          alt={product.product_name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full flex items-center shadow-sm">
            <Percent size={10} className="mr-0.5" /> {product.discount}% OFF
          </span>
        )}

        {/* Stock Badge */}
        {product.stock <= 0 ? (
          <span className="absolute top-3 right-3 bg-slate-800/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded">
            Out of Stock
          </span>
        ) : product.stock <= 5 ? (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
            Only {product.stock} Left
          </span>
        ) : null}

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-indigo-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="p-2.5 bg-white text-slate-900 rounded-full shadow-lg hover:bg-indigo-600 hover:text-white transition transform translate-y-4 group-hover:translate-y-0 duration-300"
            title="Quick View"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
              {categoryName}
            </span>
            <div className="flex items-center space-x-1 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
              <Star size={11} fill="currentColor" />
              <span>{product.rating || '5.0'}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="font-sans font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer line-clamp-1 mb-1 transition-colors"
          >
            {product.product_name}
          </h3>

          {/* Short description preview */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 h-8">
            {product.description}
          </p>
        </div>

        <div>
          {/* Price & Discount Row */}
          <div className="flex items-baseline space-x-2 mb-3">
            <span className="text-base font-bold text-slate-900">
              ${finalPrice.toFixed(2)}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-slate-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          {product.stock > 0 ? (
            <button
              onClick={() => onAddToCart(product, 1)}
              className="w-full flex items-center justify-center space-x-1.5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold tracking-wide transition-all shadow-sm active:scale-98"
              id={`add-to-cart-btn-${product.id}`}
            >
              <ShoppingBag size={14} />
              <span>Add to Cart</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold tracking-wide cursor-not-allowed"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
