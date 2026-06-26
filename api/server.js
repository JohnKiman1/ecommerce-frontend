const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 🔑 SUPABASE CREDENTIALS
const supabaseUrl = 'https://ecmcdpozacymtkvaailv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbWNkcG96YWN5bXRrdmFhaWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzk0NDQsImV4cCI6MjA5NzkxNTQ0NH0.cNQpN1QTXeY5aPHG42l9XNnujPKONEgyCKTrgZz_8ew';

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' }
});

// ============================================
// AUTH ENDPOINTS
// ============================================

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('📝 Login attempt:', username);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (data.password !== password) {
      console.log('❌ Password mismatch:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (data.role === 'locked') {
      return res.status(403).json({ error: 'Account locked. Contact support.' });
    }
    
    console.log('✅ Login successful:', username);
    
    res.json({
      message: 'Login successful',
      user: { id: data.id, username: data.username, role: data.role }
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, name } = req.body;
    
    console.log('📝 Registration attempt:', username);
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    
    if (existing) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password, email, name, role: 'viewer' }])
      .select();
    
    if (error) throw error;
    
    console.log('✅ Registration successful:', username);
    
    res.status(201).json({
      message: 'Registration successful',
      user: { id: data[0].id, username: data[0].username, role: data[0].role }
    });
  } catch (error) {
    console.error('💥 Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PRODUCT ENDPOINTS
// ============================================

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    console.log('📚 Fetching products...');
    
    const { category, minPrice, maxPrice, search, sortBy, sortOrder } = req.query;
    
    let query = supabase.from('products').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (sortBy) {
      const order = sortOrder === 'desc' ? 'desc' : 'asc';
      query = query.order(sortBy, { ascending: order === 'asc' });
    } else {
      query = query.order('id', { ascending: true });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log(`✅ Products found: ${data ? data.length : 0}`);
    res.json(data || []);
  } catch (error) {
    console.error('❌ Products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, category, image, in_stock, sizes, rating, reviews } = req.body;
    
    console.log('📝 Creating new product:', name);
    
    if (!name || price === undefined || price === null) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name,
        description: description || '',
        price: parseFloat(price),
        category: category || 'clothing',
        image: image || '/images/product-1.png',
        in_stock: in_stock !== undefined ? in_stock : true,
        sizes: sizes || ['S', 'M', 'L', 'XL'],
        rating: rating || 0,
        reviews: reviews || 0,
      }])
      .select();
    
    if (error) throw error;
    
    console.log('✅ Product created:', data[0].name);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Update a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, in_stock, sizes, rating, reviews } = req.body;
    
    console.log('📝 Updating product:', id);
    
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError || !existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const { data, error } = await supabase
      .from('products')
      .update({
        name,
        description: description || '',
        price: parseFloat(price),
        category: category || 'clothing',
        image: image || '/images/product-1.png',
        in_stock: in_stock !== undefined ? in_stock : true,
        sizes: sizes || ['S', 'M', 'L', 'XL'],
        rating: rating || 0,
        reviews: reviews || 0,
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    console.log('✅ Product updated:', data[0].name);
    res.json(data[0]);
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting product:', id);
    
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError || !existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    console.log('✅ Product deleted:', id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET product reviews
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users:user_id (username)
      `)
      .eq('product_id', req.params.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST product review
app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const { user_id, rating, comment } = req.body;
    const productId = req.params.id;
    
    if (!user_id || !rating) {
      return res.status(400).json({ error: 'User ID and rating are required' });
    }
    
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ product_id: productId, user_id, rating, comment }])
      .select();
    
    if (error) throw error;
    
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);
    
    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await supabase
        .from('products')
        .update({ 
          rating: Math.round(avgRating * 10) / 10,
          reviews: reviews.length 
        })
        .eq('id', productId);
    }
    
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CART ENDPOINTS
// ============================================

// GET cart
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', req.params.userId);
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD to cart
app.post('/api/cart', async (req, res) => {
  try {
    const { user_id, product_id, quantity, size } = req.body;
    
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user_id)
      .eq('product_id', product_id)
      .maybeSingle();
    
    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + (quantity || 1) })
        .eq('id', existing.id)
        .select();
      
      if (error) throw error;
      res.json(data[0]);
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ user_id, product_id, quantity: quantity || 1, size }])
        .select();
      
      if (error) throw error;
      res.status(201).json(data[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE cart item
app.put('/api/cart/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity <= 0) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', req.params.id);
      
      if (error) throw error;
      return res.json({ message: 'Item removed from cart' });
    }
    
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// REMOVE from cart
app.delete('/api/cart/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CLEAR cart
app.delete('/api/cart/user/:userId', async (req, res) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.params.userId);
    
    if (error) throw error;
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ORDER ENDPOINTS
// ============================================

// CREATE order
app.post('/api/orders', async (req, res) => {
  try {
    const { user_id, items, subtotal, shipping, tax, total, shipping_address, payment_method, status } = req.body;
    
    console.log('📝 Creating order for user:', user_id);
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const orderData = {
      user_id,
      items: JSON.stringify(items || []),
      subtotal: subtotal || 0,
      shipping: shipping || 0,
      tax: tax || 0,
      total: total || 0,
      shipping_address: JSON.stringify(shipping_address || {}),
      payment_method: payment_method || 'credit_card',
      status: status || 'pending'
    };
    
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();
    
    if (error) {
      console.error('❌ Order insert error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user_id);
    
    console.log('✅ Order created:', data[0].id);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('❌ Order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET user orders
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Orders fetch error:', error);
      throw error;
    }
    
    const ordersWithParsedFields = (data || []).map(order => ({
      ...order,
      items: order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : [],
      shipping_address: order.shipping_address ? (typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address) : {}
    }));
    
    res.json(ordersWithParsedFields);
  } catch (error) {
    console.error('❌ Orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single order
app.get('/api/orders/:userId/:orderId', async (req, res) => {
  try {
    const { userId, orderId } = req.params;
    
    console.log(`📝 Fetching order ${orderId} for user ${userId}`);
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      console.log('❌ Order not found:', orderId, 'for user:', userId);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = {
      ...data,
      items: data.items ? (typeof data.items === 'string' ? JSON.parse(data.items) : data.items) : [],
      shipping_address: data.shipping_address ? (typeof data.shipping_address === 'string' ? JSON.parse(data.shipping_address) : data.shipping_address) : {}
    };
    
    console.log('✅ Single order fetched:', orderId);
    res.json(order);
  } catch (error) {
    console.error('❌ Single order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER PROFILE ENDPOINTS
// ============================================

// GET user profile
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, name, phone, role, created_at')
      .eq('id', req.params.userId)
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE user profile
app.put('/api/profile/:userId', async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .update({ email, name, phone })
      .eq('id', req.params.userId)
      .select();
    
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER MANAGEMENT ENDPOINTS
// ============================================

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    console.log('📚 Fetching users...');
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, name, phone, role, created_at')
      .order('id', { ascending: true });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('❌ Users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single user
app.get('/api/users/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, name, phone, role, created_at')
      .eq('id', req.params.id)
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE user role
app.put('/api/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    console.log('📝 Updating user role:', id, '→', role);
    
    if (!['admin', 'viewer', 'locked'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', id)
      .single();
    
    if (checkError || !existing) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select('id, username, email, name, phone, role, created_at');
    
    if (error) throw error;
    
    console.log('✅ User role updated:', existing.username, '→', role);
    res.json(data[0]);
  } catch (error) {
    console.error('❌ Update role error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting user:', id);
    
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', id)
      .single();
    
    if (checkError || !existing) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { data: admins, error: countError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');
    
    if (!countError && admins && admins.length <= 1 && existing.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete the last admin user' });
    }
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    console.log('✅ User deleted:', existing.username);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RESET DATABASE (for testing)
// ============================================
app.post('/api/reset', async (req, res) => {
  try {
    console.log('🔄 Resetting database...');
    
    await supabase.from('cart_items').delete().neq('id', 0);
    await supabase.from('reviews').delete().neq('id', 0);
    await supabase.from('orders').delete().neq('id', 0);
    await supabase.from('products').delete().neq('id', 0);
    
    const products = [
      { name: 'Classic White T-Shirt', description: 'Premium cotton t-shirt', price: 29.99, category: 'clothing', image: '/images/product-1.png', rating: 4.5, reviews: 120, in_stock: true, sizes: ['S','M','L','XL'] },
      { name: 'Slim Fit Jeans', description: 'Modern slim fit jeans', price: 79.99, category: 'clothing', image: '/images/product-2.png', rating: 4.2, reviews: 85, in_stock: true, sizes: ['30','32','34','36'] },
      { name: 'Leather Jacket', description: 'Classic biker jacket', price: 199.99, category: 'clothing', image: '/images/product-3.png', rating: 4.8, reviews: 230, in_stock: true, sizes: ['S','M','L','XL'] },
      { name: 'Running Shoes', description: 'Lightweight running shoes', price: 129.99, category: 'footwear', image: '/images/product-4.png', rating: 4.6, reviews: 450, in_stock: true, sizes: ['7','8','9','10','11'] },
      { name: 'Wool Beanie', description: 'Warm wool beanie', price: 24.99, category: 'accessories', image: '/images/product-5.png', rating: 4.3, reviews: 67, in_stock: true, sizes: ['One Size'] },
      { name: 'Leather Backpack', description: 'Handcrafted leather backpack', price: 149.99, category: 'accessories', image: '/images/product-6.png', rating: 4.7, reviews: 190, in_stock: true, sizes: ['One Size'] },
      { name: 'Silk Scarf', description: 'Luxurious silk scarf', price: 59.99, category: 'accessories', image: '/images/product-7.png', rating: 4.4, reviews: 45, in_stock: true, sizes: ['One Size'] },
      { name: 'Hooded Sweatshirt', description: 'Cozy fleece sweatshirt', price: 69.99, category: 'clothing', image: '/images/product-8.png', rating: 4.1, reviews: 320, in_stock: true, sizes: ['S','M','L','XL'] },
      { name: 'Leather Belt', description: 'Genuine leather belt', price: 49.99, category: 'accessories', image: '/images/product-9.png', rating: 4.5, reviews: 78, in_stock: true, sizes: ['28','30','32','34','36'] },
      { name: 'Canvas Tote Bag', description: 'Durable canvas tote bag', price: 34.99, category: 'lifestyle', image: '/images/product-10.png', rating: 4.6, reviews: 150, in_stock: true, sizes: ['One Size'] },
      { name: 'Stainless Steel Watch', description: 'Elegant stainless steel watch', price: 249.99, category: 'accessories', image: '/images/product-11.png', rating: 4.9, reviews: 560, in_stock: true, sizes: ['One Size'] },
      { name: 'Running Shorts', description: 'Breathable running shorts', price: 44.99, category: 'footwear', image: '/images/product-12.png', rating: 4.2, reviews: 95, in_stock: true, sizes: ['S','M','L','XL'] },
      { name: 'Wool Coat', description: 'Classic wool coat', price: 299.99, category: 'clothing', image: '/images/product-13.png', rating: 4.7, reviews: 110, in_stock: true, sizes: ['S','M','L','XL'] },
      { name: 'Leather Wallet', description: 'Handcrafted leather wallet', price: 39.99, category: 'accessories', image: '/images/product-14.png', rating: 4.4, reviews: 230, in_stock: true, sizes: ['One Size'] },
      { name: 'Denim Jacket', description: 'Classic denim jacket', price: 89.99, category: 'clothing', image: '/images/product-15.png', rating: 4.3, reviews: 140, in_stock: true, sizes: ['S','M','L','XL'] }
    ];
    
    for (const product of products) {
      await supabase.from('products').insert([product]);
    }
    
    console.log('✅ Database reset successful');
    res.json({ message: 'Database reset successfully!' });
  } catch (error) {
    console.error('❌ Reset error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ERROR SIMULATION
// ============================================
app.use((req, res, next) => {
  if (req.query.simulate === '500') {
    return res.status(500).json({ error: 'Simulated server error' });
  }
  if (req.query.simulate === 'slow') {
    setTimeout(() => next(), 8000);
  } else {
    next();
  }
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 E-commerce API running on port ${PORT}`);
  console.log('📚 /api/products - Product CRUD (GET, POST, PUT, DELETE)');
  console.log('🛒 /api/cart - Cart operations');
  console.log('📦 /api/orders - Order operations (POST, GET all, GET single)');
  console.log('👤 /api/profile - User profile');
  console.log('👥 /api/users - User management');
  console.log('🔐 /api/login - Login');
  console.log('📝 /api/register - Register');
  console.log('🔄 /api/reset - Reset database');
  console.log('⚠️ Add ?simulate=500 or ?simulate=slow to test errors');
});