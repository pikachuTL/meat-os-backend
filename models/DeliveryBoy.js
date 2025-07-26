const mongoose = require('mongoose');

const deliveryBoySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  vehicleNumber: { type: String, required: true },
  vehicleType: { type: String, enum: ['Bike', 'Scooter', 'Car'], default: 'Bike' },
  rating: { type: Number, default: 5.0 },
  isActive: { type: Boolean, default: true },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  assignedOrders: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    status: { 
      type: String, 
      enum: ['assigned', 'picked', 'delivered'], 
      default: 'assigned' 
    },
    assignedAt: { type: Date, default: Date.now },
    pickedAt: Date,
    deliveredAt: Date
  }],
  totalDeliveries: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema); 