const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Place order (customer)
router.post('/', async (req, res) => {
  try {
    const { 
      customerName, 
      customerPhone, 
      customerAddress, 
      items, 
      total, 
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId 
    } = req.body;
    
    const orderData = { 
      customerName, 
      customerPhone, 
      customerAddress, 
      items, 
      total,
      paymentMethod: paymentMethod || 'COD'
    };

    // If Razorpay payment, add payment details
    if (paymentMethod === 'Razorpay' && razorpayOrderId && razorpayPaymentId) {
      orderData.razorpayOrderId = razorpayOrderId;
      orderData.razorpayPaymentId = razorpayPaymentId;
      orderData.paymentStatus = 'paid';
    }

    const order = new Order(orderData);
    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('Error in POST /api/order:', err);
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
});

// Get all orders (admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error in GET /api/order:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { paymentStatus, orderStatus } = req.body;
    const updateData = {};
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (orderStatus) updateData.orderStatus = orderStatus;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status', error: err.message });
  }
});

// Get customer orders by phone number
router.get('/customer/:phone', async (req, res) => {
  try {
    const orders = await Order.find({ customerPhone: req.params.phone }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customer orders', error: err.message });
  }
});

// Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
});

module.exports = router;
