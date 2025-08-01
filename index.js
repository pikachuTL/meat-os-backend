const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('meat-OS backend running');
});

// Health check route (add this before app.listen)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const categoryRoutes = require('./routes/category');
app.use('/api/category', categoryRoutes);

const productRoutes = require('./routes/product');
app.use('/api/product', productRoutes);

const orderRoutes = require('./routes/order');
app.use('/api/order', orderRoutes);

const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

const deliveryRoutes = require('./routes/delivery');
app.use('/api/delivery', deliveryRoutes);

const perKmRateRoutes = require('./routes/perkmrate');
app.use('/api/perkmrate', perKmRateRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 