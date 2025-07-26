const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Category = require('../models/Category');
const router = express.Router();

// Multer setup with auto-folder creation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'category'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Create category with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    // Always save relative path, extract just the filename and folder
    let image = '';
    if (req.file) {
      image = `category/${req.file.filename}`;
    }
    console.log('Original path:', req.file?.path);
    console.log('Saved image path:', image);
    
    const category = new Category({ name, image });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error('Error in POST /api/category:', err);
    res.status(500).json({ message: 'Error creating category', error: err.message });
  }
});

// Test route to check image upload
router.post('/test-upload', upload.single('image'), async (req, res) => {
  try {
    console.log('File received:', req.file);
    console.log('File path:', req.file?.path);
    console.log('File filename:', req.file?.filename);
    
    const imagePath = req.file ? `category/${req.file.filename}` : '';
    console.log('Saved image path:', imagePath);
    
    res.json({ 
      message: 'Test upload successful',
      file: req.file,
      savedPath: imagePath,
      fullUrl: req.file ? `https://meat-os-backend-production.up.railway.app/uploads/${imagePath}` : ''
    });
  } catch (err) {
    console.error('Error in test upload:', err);
    res.status(500).json({ message: 'Error in test upload', error: err.message });
  }
});

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error('Error in GET /api/category:', err);
    res.status(500).json({ message: 'Error fetching categories', error: err.message });
  }
});

// Update category
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    // Always save relative path, extract just the filename and folder
    let image = undefined;
    if (req.file) {
      image = `category/${req.file.filename}`;
    }
    console.log('Original path:', req.file?.path);
    console.log('Saved image path:', image);
    
    const updateData = { name };
    if (image) updateData.image = image;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(category);
  } catch (err) {
    console.error('Error in PUT /api/category/:id:', err);
    res.status(500).json({ message: 'Error updating category', error: err.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/category/:id:', err);
    res.status(500).json({ message: 'Error deleting category', error: err.message });
  }
});

module.exports = router;