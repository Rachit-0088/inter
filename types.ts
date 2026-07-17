export interface User {
  id: number;
  username: string;
  email: string;
  password?: string; // Optional when sending to client
  phone: string;
  address: string;
  created_at: string;
  isAdmin?: boolean;
}

export interface Category {
  id: number;
  category_name: string;
}

export interface Product {
  id: number;
  category_id: number;
  product_name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  discount: number; // Percentage discount (e.g., 10 for 10%)
  rating: number;   // Rating from 0 to 5
  specifications?: string; // Add specifications as a string or key-value
  reviews?: Review[];
}

export interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
}

// Client-side representation with product details loaded
export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  order_date: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shipping_address: string;
  payment_method: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { product_name: string; image: string })[];
  username?: string;
}
