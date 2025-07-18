const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Place order (customer)
router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, items, total } = req.body;
    const order = new Order({ customerName, customerPhone, customerAddress, items, total });
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
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status', error: err.message });
  }
});

module.exports = router;
