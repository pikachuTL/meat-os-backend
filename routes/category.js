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
    const image = req.file ? req.file.path : '';
    const category = new Category({ name, image });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error('Error in POST /api/category:', err);
    res.status(500).json({ message: 'Error creating category', error: err.message });
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
    const image = req.file ? req.file.path : undefined;
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