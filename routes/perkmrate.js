const express = require('express');
const PerKmRate = require('../models/PerKmRate');
const router = express.Router();

// Get current per-km rate
router.get('/', async (req, res) => {
  try {
    let rateDoc = await PerKmRate.findOne().sort({ updatedAt: -1 });
    if (!rateDoc) {
      rateDoc = await PerKmRate.create({ rate: 8 });
    }
    res.json({ rate: rateDoc.rate });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching rate', error: err.message });
  }
});

// Set/update per-km rate (admin only)
router.post('/', async (req, res) => {
  try {
    const { rate } = req.body;
    if (typeof rate !== 'number' || rate <= 0) {
      return res.status(400).json({ message: 'Invalid rate' });
    }
    const rateDoc = await PerKmRate.create({ rate });
    res.json({ message: 'Rate updated', rate: rateDoc.rate });
  } catch (err) {
    res.status(500).json({ message: 'Error updating rate', error: err.message });
  }
});

module.exports = router; 