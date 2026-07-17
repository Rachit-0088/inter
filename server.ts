import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/dbService';
import { Order, OrderWithItems, Product } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper middleware to get current user from headers
  const getCurrentUser = (req: express.Request) => {
    const userIdHeader = req.headers['x-user-id'] || req.headers['authorization'];
    if (!userIdHeader) return null;
    const userId = parseInt(userIdHeader as string, 10);
    if (isNaN(userId)) return null;
    return db.getUsers().find(u => u.id === userId) || null;
  };

  // --- API ROUTES ---

  // 1. User Authentication
  app.post('/api/auth/register', (req, res) => {
    const { username, email, password, phone, address } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    const users = db.getUsers();
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email already registered' });
    }

    const newUser = db.addUser({
      username,
      email,
      password,
      phone: phone || '',
      address: address || '',
      isAdmin: false
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  });

  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const users = db.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.get('/api/auth/profile', (req, res) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.put('/api/auth/profile', (req, res) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { phone, address, email } = req.body;
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === user.id);

    if (index !== -1) {
      if (email) users[index].email = email;
      if (phone !== undefined) users[index].phone = phone;
      if (address !== undefined) users[index].address = address;
      db.saveUsers(users);

      const { password: _, ...userWithoutPassword } = users[index];
      return res.json(userWithoutPassword);
    }

    res.status(404).json({ error: 'User not found' });
  });

  // Admin list of users
  app.get('/api/users', (req, res) => {
    const user = getCurrentUser(req);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }
    const users = db.getUsers().map(({ password: _, ...u }) => u);
    res.json(users);
  });

  // 2. Categories Management
  app.get('/api/categories', (req, res) => {
    res.json(db.getCategories());
  });

  app.post('/api/categories', (req, res) => {
    const user = getCurrentUser(req);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const { category_name } = req.body;
    if (!category_name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const categories = db.getCategories();
    if (categories.some(c => c.category_name.toLowerCase() === category_name.toLowerCase())) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const newCat = db.addCategory(category_name);
    res.status(201).json(newCat);
  });

  app.delete('/api/categories/:id', (req, res) => {
    const user = getCurrentUser(req);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    db.deleteCategory(id);
    res.json({ success: true, message: 'Category deleted' });
  });

  // 3. Products Management
  app.get('/api/products', (req, res) => {
    const { category, search } = req.query;
    let products = db.getProducts();

    if (category) {
      const catId = parseInt(category as string, 10);
      if (!isNaN(catId)) {
        products = products.filter(p => p.category_id === catId);
      }
    }

    if (search) {
      const query = (search as string).toLowerCase();
      products = products.filter(p =>
        p.product_name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    res.json(products);
  });

  app.get('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Product ID' });

    const products = db.getProducts();
    const product = products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  });

  app.post('/api/products', (req, res) => {
    const user = getCurrentUser(req);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const { product_name, category_id, description, price, stock, image, discount, specifications } = req.body;

    if (!product_name || !category_id || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Missing required product parameters' });
    }

    const newProd = db.addProduct({
      product_name,
      category_id: parseInt(category_id, 10),
      description: description || '',
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60',
      discount: discount !== undefined ? parseInt(discount, 10) : 0,
      specifications: specifications || '',
    });

    res.status(201).json(newProd);
  });

  app.put('/api/products/:id', (req, res) => {
    const user = getCurrentUser(req);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Product ID' });

    const updated = db.updateProduct(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updated);
  });

  app.delete('/api/products/:id', (req, res) => {
    const user = getCurrentUser(req);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Product ID' });

    db.deleteProduct(id);
    res.json({ success: true, message: 'Product deleted successfully' });
  });

  // Post Product Review
  app.post('/api/products/:id/reviews', (req, res) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Please log in to leave reviews' });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Product ID' });

    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment are required' });
    }

    const products = db.getProducts();
    const pIndex = products.findIndex(p => p.id === id);
    if (pIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const reviews = products[pIndex].reviews || [];
    const newReviewId = reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
    const newReview = {
      id: newReviewId,
      username: user.username,
      rating: parseFloat(rating),
      comment,
      created_at: new Date().toISOString(),
    };

    reviews.push(newReview);
    products[pIndex].reviews = reviews;

    // Recalculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    products[pIndex].rating = parseFloat((totalRating / reviews.length).toFixed(1));

    db.saveProducts(products);
    res.status(201).json(products[pIndex]);
  });

  // 4. Shopping Cart
  app.get('/api/cart', (req, res) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const cartItems = db.getCartForUser(user.id);
    const products = db.getProducts();

    // Map product details into the cart items
    const detailedCart = cartItems.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        ...item,
        product: product || {
          id: item.product_id,
          category_id: 1,
          product_name: 'Unknown Product',
          description: 'This product is no longer available.',
          price: 0,
          stock: 0,
          image: '',
          discount: 0,
          rating: 0
        }
      };
    });

    res.json(detailedCart);
  });

  app.post('/api/cart', (req, res) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { product_id, quantity } = req.body;
    if (!product_id || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    const products = db.getProducts();
    const product = products.find(p => p.id === product_id);
    if (!product) {
      return res.status(444).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: `Only ${product.stock} items available in stock.` });
    }

    db.addToCart(user.id, product_id, quantity);
    res.json({ success: true, message: 'Item added to cart' });
  });

  app.put('/api/cart', (req, res) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { product_id, quantity } = req.body;
    if (!product_id || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    const products = db.getProducts();
    const product = products.find(p => p.id === product_id);
    if (product && product.stock < quantity) {
      return res.status(400).json({ error: `Only ${product.stock} items available in stock.` });
    }

    db.updateCartQuantity(user.id, product_id, quantity);
    res.json({ success: true, message: 'Cart updated successfully' });
  });

  app.delete('/api/cart/:productId', (req, res) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });

    db.removeFromCart(user.id, productId);
    res.json({ success: true, message: 'Item removed from cart' });
  });

  // 5. Orders & Checkout
  app.post('/api/orders', (req, res) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { shipping_address, payment_method, items, total_amount } = req.body;

    if (!shipping_address || !payment_method || !items || !items.length || total_amount === undefined) {
      return res.status(400).json({ error: 'Missing shipping details, payment, items or total amount' });
    }

    // Double check inventory stock
    const products = db.getProducts();
    for (const item of items) {
      const prod = products.find(p => p.id === item.product_id);
      if (!prod) {
        return res.status(400).json({ error: `Product not found` });
      }
      if (prod.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${prod.product_name}. Only ${prod.stock} items left.` });
      }
    }

    const newOrder = db.createOrder(user.id, items, total_amount, shipping_address, payment_method);
    res.status(201).json(newOrder);
  });

  app.get('/api/orders', (req, res) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let orders: Order[] = [];
    const allOrders = db.getOrders();

    if (user.isAdmin) {
      orders = allOrders;
    } else {
      orders = allOrders.filter(o => o.user_id === user.id);
    }

    const orderItems = db.getOrderItems();
    const products = db.getProducts();
    const users = db.getUsers();

    // Map order items and customer name into the order details
    const detailedOrders: OrderWithItems[] = orders.map(order => {
      const itemsForOrder = orderItems
        .filter(oi => oi.order_id === order.id)
        .map(oi => {
          const prod = products.find(p => p.id === oi.product_id);
          return {
            ...oi,
            product_name: prod ? prod.product_name : 'Unknown Product',
            image: prod ? prod.image : '',
          };
        });

      const customer = users.find(u => u.id === order.user_id);

      return {
        ...order,
        items: itemsForOrder,
        username: customer ? customer.username : 'Unknown User',
      };
    });

    // Sort by newest first
    detailedOrders.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

    res.json(detailedOrders);
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const user = getCurrentUser(req);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(orderId) || !status) {
      return res.status(400).json({ error: 'Invalid order ID or status' });
    }

    const updated = db.updateOrderStatus(orderId, status);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updated);
  });

  // --- VITE MIDDLEWARE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
