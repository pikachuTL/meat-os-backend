const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String }, // URL or path to product image
  price: { type: Number, required: true },
  unit: { type: String, enum: ['kg', 'gram', 'pcs'], required: true },
  description: { type: String },
  available: { type: Boolean, default: true },
});

module.exports = mongoose.model('Product', productSchema); 