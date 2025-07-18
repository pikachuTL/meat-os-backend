const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const router = express.Router();

// Multer setup with auto-folder creation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'product');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Create product with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, unit, description, available } = req.body;
    const image = req.file ? req.file.path : '';
    const product = new Product({ name, category, image, price, unit, description, available });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error in POST /api/product:', err);
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
});

// Get all products (with category populated)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (err) {
    console.error('Error in GET /api/product:', err);
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

// Update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, unit, description, available } = req.body;
    const image = req.file ? req.file.path : undefined;
    const updateData = { name, category, price, unit, description, available };
    if (image) updateData.image = image;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(product);
  } catch (err) {
    console.error('Error in PUT /api/product/:id:', err);
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/product/:id:', err);
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
});

module.exports = router;