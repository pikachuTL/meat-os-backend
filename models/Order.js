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
  paymentMethod: { 
    type: String, 
    default: 'COD',
    enum: ['COD', 'UPI', 'Razorpay']
  },
  paymentStatus: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'paid', 'delivered']
  },
  orderStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked', 'out_for_delivery', 'delivered']
  },
  deliveryBoy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryBoy' },
    name: String,
    phone: String,
    vehicleNumber: String,
    vehicleType: String
  },
  deliveryTimeline: {
    orderPlaced: { type: Date, default: Date.now },
    confirmed: Date,
    preparing: Date,
    ready: Date,
    assigned: Date,
    picked: Date,
    outForDelivery: Date,
    delivered: Date
  },
  estimatedDelivery: Date,
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  distance: { type: Number }, // in km
  deliveryEarnings: { type: Number },
  deliveryPaymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
