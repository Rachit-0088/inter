import fs from 'fs';
import path from 'path';
import { User, Category, Product, CartItem, Order, OrderItem, Review } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

const FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  categories: path.join(DATA_DIR, 'categories.json'),
  products: path.join(DATA_DIR, 'products.json'),
  carts: path.join(DATA_DIR, 'carts.json'),
  orders: path.join(DATA_DIR, 'orders.json'),
  orderItems: path.join(DATA_DIR, 'order_items.json'),
};

// Seed Data
const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, category_name: 'Electronics' },
  { id: 2, category_name: 'Apparel' },
  { id: 3, category_name: 'Home & Living' },
  { id: 4, category_name: 'Sports & Outdoors' },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    category_id: 1,
    product_name: 'Veloce Pro Smartphone',
    description: 'Experience unmatched speed and absolute clarity with the Veloce Pro. Equipped with a stunning 6.7" OLED display, professional-grade triple camera system, and all-day battery life.',
    price: 899.99,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60',
    discount: 10,
    rating: 4.8,
    specifications: 'Display: 6.7" OLED 120Hz; Processor: Octa-core 3.2GHz; Memory: 12GB RAM, 256GB Storage; Battery: 5000mAh with 65W fast charging; Camera: 50MP + 48MP + 12MP.',
    reviews: [
      { id: 1, username: 'tech_enthusiast', rating: 5, comment: 'Phenomenal device! The display is incredibly sharp and smooth.', created_at: '2026-06-15T10:00:00Z' },
      { id: 2, username: 'jane_d', rating: 4.5, comment: 'Great camera and battery life, but a bit heavy in hand.', created_at: '2026-06-20T14:30:00Z' }
    ]
  },
  {
    id: 2,
    category_id: 1,
    product_name: 'AeroBook Ultra Thin Laptop',
    description: 'The ultimate laptop for professionals on the move. Crafted in an ultra-light aluminum unibody, featuring the latest processing power and a vivid screen that brings everything to life.',
    price: 1249.99,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=600&auto=format&fit=crop&q=60',
    discount: 5,
    rating: 4.7,
    specifications: 'Display: 14" IPS 2K Display; CPU: Intel i7 / 16 threads; Memory: 16GB LPDDR5, 512GB NVMe SSD; Weight: 1.1kg; Battery Life: Up to 14 hours.',
    reviews: [
      { id: 1, username: 'codelover', rating: 5, comment: 'Extremely light and fast. Perfect for my coding projects!', created_at: '2026-07-01T09:15:00Z' }
    ]
  },
  {
    id: 3,
    category_id: 1,
    product_name: 'AcousticPure Wireless ANC Headphones',
    description: 'Immerse yourself in pure studio sound quality. Industry-leading Active Noise Cancellation ensures you hear nothing but your music, even in the loudest environments.',
    price: 299.99,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60',
    discount: 15,
    rating: 4.9,
    specifications: 'Type: Over-Ear; Drivers: 40mm dynamic; Battery: 45 hours with ANC off; Bluetooth: Version 5.3; Audio Codecs: LDAC, AAC, SBC.',
    reviews: [
      { id: 1, username: 'audiophile_sam', rating: 5, comment: 'Outstanding clarity and deep bass response. ANC is magic!', created_at: '2026-07-05T18:45:00Z' }
    ]
  },
  {
    id: 4,
    category_id: 1,
    product_name: 'Chronos Smartwatch Series 5',
    description: 'Track your health, receive immediate notifications, and style your wrist with a customizable display. Features blood oxygen monitoring, GPS mapping, and sleep analysis.',
    price: 249.99,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60',
    discount: 0,
    rating: 4.5,
    specifications: 'Display: Always-on AMOLED; Sensors: Heart rate, SpO2, ECG, Gyroscope, GPS; Water Resistance: 50m (5ATM); Battery: 7 days.',
    reviews: [
      { id: 1, username: 'runner_girl', rating: 4, comment: 'GPS tracking is extremely accurate. Highly recommend for athletes.', created_at: '2026-07-10T08:22:00Z' }
    ]
  },
  {
    id: 5,
    category_id: 2,
    product_name: 'Urban Explorer Everyday Backpack',
    description: 'Designed to adapt to your daily grind. Water-resistant fabrics, secure laptop compartment, and intelligent pockets organize your tech and essentials comfortably.',
    price: 79.99,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60',
    discount: 20,
    rating: 4.6,
    specifications: 'Capacity: 24 Liters; Material: 900D Water-resistant Polyester; Laptop Pocket: Fits up to 16" laptops; Dimensions: 48 x 30 x 15 cm.',
    reviews: [
      { id: 1, username: 'nomad', rating: 5, comment: 'Tons of pockets and fits my laptop perfectly. Clean look!', created_at: '2026-07-12T11:00:00Z' }
    ]
  },
  {
    id: 6,
    category_id: 3,
    product_name: 'Barista One Precision Espresso Maker',
    description: 'Brew coffee-shop quality drinks at home. Engineered with professional temperature controls, precise steam pressure, and an elegant brushed metal finish.',
    price: 199.99,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop&q=60',
    discount: 10,
    rating: 4.4,
    specifications: 'Pressure: 15-Bar Italian pump; Water Tank Capacity: 1.8 Liters; Heating: Thermoblock instant heating; Milk Frother: Commercial style steam wand.',
    reviews: [
      { id: 1, username: 'coffee_snob', rating: 4, comment: 'Pulls excellent espresso shots. Takes a bit of practice to froth milk perfectly.', created_at: '2026-07-14T07:30:00Z' }
    ]
  },
  {
    id: 7,
    category_id: 4,
    product_name: 'HyperStrides Lightweight Running Shoes',
    description: 'Float over concrete. Featuring a responsive nitrogen-infused foam midsole and ultra-breathable engineered mesh upper, these shoes provide max speed with max comfort.',
    price: 129.99,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60',
    discount: 15,
    rating: 4.7,
    specifications: 'Midsole: HyperFoam Cushioning; Weight: 230g; Drop: 8mm; Best for: Road Running, Marathons, Daily Training.',
    reviews: [
      { id: 1, username: 'marathon_man', rating: 5, comment: 'Like running on clouds. Best running shoes I have owned.', created_at: '2026-07-15T15:10:00Z' }
    ]
  },
  {
    id: 8,
    category_id: 3,
    product_name: 'Aura Classic Minimalist Wristwatch',
    description: 'Timeless style meets modern simplicity. This elegant accessory features a ultra-thin case, premium leather straps, and precise quartz movement.',
    price: 159.99,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=60',
    discount: 0,
    rating: 4.8,
    specifications: 'Case Diameter: 40mm; Case Thickness: 7.5mm; Strap: Genuine Italian Leather; Movement: Swiss Quartz; Water Resistance: 3 ATM.',
    reviews: [
      { id: 1, username: 'style_guru', rating: 5, comment: 'Absolutely gorgeous minimalist piece. Gets compliments constantly!', created_at: '2026-07-16T12:00:00Z' }
    ]
  }
];

// Helper to initialize files with seed data
function initializeDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(FILES.users)) {
    // Seed an admin user and a customer user
    const defaultUsers: User[] = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@ecommerce.com',
        password: 'admin123', // Encrypted as simple comparison for dev or standard password
        phone: '1234567890',
        address: '123 Admin Head Office, Silicon Valley',
        created_at: new Date().toISOString(),
        isAdmin: true,
      },
      {
        id: 2,
        username: 'customer',
        email: 'customer@ecommerce.com',
        password: 'customer123',
        phone: '9876543210',
        address: '456 Green Street, New York City, NY',
        created_at: new Date().toISOString(),
        isAdmin: false,
      }
    ];
    fs.writeFileSync(FILES.users, JSON.stringify(defaultUsers, null, 2));
  }

  if (!fs.existsSync(FILES.categories)) {
    fs.writeFileSync(FILES.categories, JSON.stringify(DEFAULT_CATEGORIES, null, 2));
  }

  if (!fs.existsSync(FILES.products)) {
    fs.writeFileSync(FILES.products, JSON.stringify(DEFAULT_PRODUCTS, null, 2));
  }

  if (!fs.existsSync(FILES.carts)) {
    fs.writeFileSync(FILES.carts, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(FILES.orders)) {
    fs.writeFileSync(FILES.orders, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(FILES.orderItems)) {
    fs.writeFileSync(FILES.orderItems, JSON.stringify([], null, 2));
  }
}

// Read and Write Helper Operations
function readData<T>(filePath: string): T[] {
  initializeDatabase();
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch (error) {
    console.error(`Error reading database file at ${filePath}:`, error);
    return [];
  }
}

function writeData<T>(filePath: string, data: T[]): void {
  initializeDatabase();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing database file at ${filePath}:`, error);
  }
}

export const db = {
  // --- USERS ---
  getUsers: () => readData<User>(FILES.users),
  saveUsers: (users: User[]) => writeData<User>(FILES.users, users),
  addUser: (user: Omit<User, 'id' | 'created_at'>) => {
    const users = db.getUsers();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser: User = {
      ...user,
      id: newId,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    db.saveUsers(users);
    return newUser;
  },

  // --- CATEGORIES ---
  getCategories: () => readData<Category>(FILES.categories),
  saveCategories: (categories: Category[]) => writeData<Category>(FILES.categories, categories),
  addCategory: (name: string) => {
    const categories = db.getCategories();
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    const newCat: Category = { id: newId, category_name: name };
    categories.push(newCat);
    db.saveCategories(categories);
    return newCat;
  },
  deleteCategory: (id: number) => {
    const categories = db.getCategories().filter(c => c.id !== id);
    db.saveCategories(categories);
  },

  // --- PRODUCTS ---
  getProducts: () => readData<Product>(FILES.products),
  saveProducts: (products: Product[]) => writeData<Product>(FILES.products, products),
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => {
    const products = db.getProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      ...product,
      id: newId,
      rating: 5.0,
      reviews: [],
    };
    products.push(newProduct);
    db.saveProducts(products);
    return newProduct;
  },
  updateProduct: (id: number, updatedFields: Partial<Product>) => {
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };
      db.saveProducts(products);
      return products[index];
    }
    return null;
  },
  deleteProduct: (id: number) => {
    const products = db.getProducts().filter(p => p.id !== id);
    db.saveProducts(products);
  },

  // --- CARTS ---
  getCartItems: () => readData<CartItem>(FILES.carts),
  saveCartItems: (items: CartItem[]) => writeData<CartItem>(FILES.carts, items),
  getCartForUser: (userId: number) => {
    const items = db.getCartItems();
    return items.filter(item => item.user_id === userId);
  },
  addToCart: (userId: number, productId: number, quantity: number) => {
    const items = db.getCartItems();
    const existing = items.find(item => item.user_id === userId && item.product_id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
      items.push({
        id: newId,
        user_id: userId,
        product_id: productId,
        quantity,
      });
    }
    db.saveCartItems(items);
  },
  updateCartQuantity: (userId: number, productId: number, quantity: number) => {
    let items = db.getCartItems();
    const item = items.find(i => i.user_id === userId && i.product_id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        items = items.filter(i => !(i.user_id === userId && i.product_id === productId));
      }
      db.saveCartItems(items);
    }
  },
  removeFromCart: (userId: number, productId: number) => {
    const items = db.getCartItems().filter(i => !(i.user_id === userId && i.product_id === productId));
    db.saveCartItems(items);
  },
  clearCart: (userId: number) => {
    const items = db.getCartItems().filter(i => i.user_id !== userId);
    db.saveCartItems(items);
  },

  // --- ORDERS ---
  getOrders: () => readData<Order>(FILES.orders),
  saveOrders: (orders: Order[]) => writeData<Order>(FILES.orders, orders),
  getOrderItems: () => readData<OrderItem>(FILES.orderItems),
  saveOrderItems: (items: OrderItem[]) => writeData<OrderItem>(FILES.orderItems, items),
  createOrder: (userId: number, items: { product_id: number; quantity: number; price: number }[], totalAmount: number, shippingAddress: string, paymentMethod: string) => {
    const orders = db.getOrders();
    const orderItems = db.getOrderItems();

    const newOrderId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    const newOrder: Order = {
      id: newOrderId,
      user_id: userId,
      total_amount: totalAmount,
      order_date: new Date().toISOString(),
      status: 'Pending',
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
    };

    orders.push(newOrder);
    db.saveOrders(orders);

    let nextItemId = orderItems.length > 0 ? Math.max(...orderItems.map(oi => oi.id)) + 1 : 1;
    const products = db.getProducts();

    items.forEach(item => {
      orderItems.push({
        id: nextItemId++,
        order_id: newOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      });

      // Update Stock (Decrement stock based on purchase)
      const pIndex = products.findIndex(p => p.id === item.product_id);
      if (pIndex !== -1) {
        products[pIndex].stock = Math.max(0, products[pIndex].stock - item.quantity);
      }
    });

    db.saveProducts(products);
    db.saveOrderItems(orderItems);

    // Clear cart for this user
    db.clearCart(userId);

    return newOrder;
  },
  updateOrderStatus: (orderId: number, status: Order['status']) => {
    const orders = db.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      db.saveOrders(orders);
      return orders[index];
    }
    return null;
  }
};

// Auto run base initializer on module load
initializeDatabase();
