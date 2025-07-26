const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// Initialize Razorpay (disabled for now)
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// Create payment order (disabled for now)
router.post('/create-order', async (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Online payment is currently disabled. Please use Cash on Delivery.'
  });
});

// Verify payment (disabled for now)
router.post('/verify-payment', async (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Online payment is currently disabled. Please use Cash on Delivery.'
  });
});

module.exports = router; 