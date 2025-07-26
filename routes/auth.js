const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const router = express.Router();

// Admin signup
router.post('/admin/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating admin', error: err.message });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Customer direct login (without OTP)
router.post('/customer/login', async (req, res) => {
  try {
    const { phone, email, name, addresses } = req.body;
    
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    let customer = await Customer.findOne({ phone });
    
    if (!customer) {
      // Create new customer
      customer = new Customer({ 
        phone, 
        name: name || `Customer ${phone}`, 
        email, 
        addresses: addresses || [], 
        isVerified: true 
      });
    } else {
      // Update existing customer details if provided
      if (name) customer.name = name;
      if (email) customer.email = email;
      if (addresses) customer.addresses = addresses;
      customer.isVerified = true;
    }
    
    await customer.save();
    res.json({ message: 'Customer logged in successfully', customer });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in customer', error: err.message });
  }
});

// Update customer profile
router.post('/customer/update-profile', async (req, res) => {
  try {
    const { phone, name, email, addresses } = req.body;
    
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Full name is required' });
    }
    
    let customer = await Customer.findOne({ phone });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    customer.name = name;
    customer.email = email || customer.email;
    customer.addresses = addresses || customer.addresses;
    
    await customer.save();
    res.json({ message: 'Profile updated', customer });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

// Get customer wishlist by phone
router.get('/wishlist/:phone', async (req, res) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone }).populate('wishlist');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ wishlist: customer.wishlist || [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wishlist', error: err.message });
  }
});

// Add product to wishlist
router.post('/wishlist/add', async (req, res) => {
  try {
    const { phone, productId } = req.body;
    if (!phone || !productId) return res.status(400).json({ message: 'Phone and productId required' });
    const customer = await Customer.findOne({ phone });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    if (!customer.wishlist) customer.wishlist = [];
    if (!customer.wishlist.includes(productId)) {
      customer.wishlist.push(productId);
      await customer.save();
    }
    const updated = await Customer.findOne({ phone }).populate('wishlist');
    res.json({ wishlist: updated.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to wishlist', error: err.message });
  }
});

// Remove product from wishlist
router.post('/wishlist/remove', async (req, res) => {
  try {
    const { phone, productId } = req.body;
    if (!phone || !productId) return res.status(400).json({ message: 'Phone and productId required' });
    const customer = await Customer.findOne({ phone });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    customer.wishlist = (customer.wishlist || []).filter(id => id.toString() !== productId);
    await customer.save();
    const updated = await Customer.findOne({ phone }).populate('wishlist');
    res.json({ wishlist: updated.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from wishlist', error: err.message });
  }
});

module.exports = router;