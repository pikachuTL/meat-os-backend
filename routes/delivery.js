const express = require('express');
const Order = require('../models/Order');
const DeliveryBoy = require('../models/DeliveryBoy');
const router = express.Router();

// Get available orders for delivery
router.get('/available-orders', async (req, res) => {
  try {
    const availableOrders = await Order.find({
      orderStatus: 'ready',
      'deliveryBoy.id': { $exists: false }
    }).sort({ createdAt: 1 });
    
    res.json(availableOrders);
  } catch (err) {
    console.error('Error fetching available orders:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

// Get delivery boy's assigned orders
router.get('/assigned-orders/:deliveryBoyId', async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const assignedOrders = await Order.find({
      'deliveryBoy.id': deliveryBoyId,
      orderStatus: { $in: ['assigned', 'picked', 'out_for_delivery'] }
    }).sort({ 'deliveryTimeline.assigned': -1 });
    
    res.json(assignedOrders);
  } catch (err) {
    console.error('Error fetching assigned orders:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

// Assign order to delivery boy
router.post('/assign-order', async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;
    
    // Get delivery boy details
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    
    // Update order
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus: 'assigned',
        deliveryBoy: {
          id: deliveryBoy._id,
          name: deliveryBoy.name,
          phone: deliveryBoy.phone,
          vehicleNumber: deliveryBoy.vehicleNumber,
          vehicleType: deliveryBoy.vehicleType
        },
        'deliveryTimeline.assigned': new Date(),
        estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes
      },
      { new: true }
    );
    
    // Add to delivery boy's assigned orders
    await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      {
        $push: {
          assignedOrders: {
            orderId: order._id,
            status: 'assigned',
            assignedAt: new Date()
          }
        }
      }
    );
    
    res.json({ message: 'Order assigned successfully', order });
  } catch (err) {
    console.error('Error assigning order:', err);
    res.status(500).json({ message: 'Error assigning order', error: err.message });
  }
});

// Mark order as picked up
router.post('/pick-order', async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;
    
    // Update order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus: 'picked',
        'deliveryTimeline.picked': new Date()
      },
      { new: true }
    );
    
    // Update delivery boy's order status
    await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      {
        $set: {
          'assignedOrders.$[elem].status': 'picked',
          'assignedOrders.$[elem].pickedAt': new Date()
        }
      },
      {
        arrayFilters: [{ 'elem.orderId': orderId }]
      }
    );
    
    res.json({ message: 'Order picked successfully', order });
  } catch (err) {
    console.error('Error picking order:', err);
    res.status(500).json({ message: 'Error picking order', error: err.message });
  }
});

// Mark order as out for delivery
router.post('/out-for-delivery', async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;
    
    // Update order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus: 'out_for_delivery',
        'deliveryTimeline.outForDelivery': new Date()
      },
      { new: true }
    );
    
    res.json({ message: 'Order out for delivery', order });
  } catch (err) {
    console.error('Error updating delivery status:', err);
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
});

// Mark order as delivered
router.post('/deliver-order', async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;
    
    // Update order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus: 'delivered',
        paymentStatus: 'delivered',
        'deliveryTimeline.delivered': new Date()
      },
      { new: true }
    );
    
    // Update delivery boy's order status and stats
    await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      {
        $set: {
          'assignedOrders.$[elem].status': 'delivered',
          'assignedOrders.$[elem].deliveredAt': new Date()
        },
        $inc: {
          totalDeliveries: 1,
          totalEarnings: 50 // Fixed delivery fee
        }
      },
      {
        arrayFilters: [{ 'elem.orderId': orderId }]
      }
    );
    
    res.json({ message: 'Order delivered successfully', order });
  } catch (err) {
    console.error('Error delivering order:', err);
    res.status(500).json({ message: 'Error delivering order', error: err.message });
  }
});

// Get delivery boy stats
router.get('/stats/:deliveryBoyId', async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    
    const todayDeliveries = await Order.countDocuments({
      'deliveryBoy.id': deliveryBoyId,
      orderStatus: 'delivered',
      'deliveryTimeline.delivered': {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });
    
    res.json({
      totalDeliveries: deliveryBoy.totalDeliveries,
      totalEarnings: deliveryBoy.totalEarnings,
      todayDeliveries,
      rating: deliveryBoy.rating,
      isActive: deliveryBoy.isActive
    });
  } catch (err) {
    console.error('Error fetching delivery boy stats:', err);
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
});

module.exports = router; 