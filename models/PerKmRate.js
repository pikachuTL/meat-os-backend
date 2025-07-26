const mongoose = require('mongoose');

const perKmRateSchema = new mongoose.Schema({
  rate: { type: Number, required: true, default: 8 }, // Rs per km
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PerKmRate', perKmRateSchema); 