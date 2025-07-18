const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number,
      unit: String
    }
  ],
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'COD' }, // 'COD', 'UPI', 'Card', etc.
  paymentStatus: { type: String, default: 'pending' }, // 'pending', 'paid'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
