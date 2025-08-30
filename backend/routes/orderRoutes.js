const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Create new order
router.post('/', protect, async (req, res) => {
    try {
        const Order = require('../models/orderModel');
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Validate shipping price based on district
        const validateShippingPrice = (address, providedShippingPrice) => {
            if (!address || !address.state) {
                return providedShippingPrice === 100; // Default for unknown district
            }
            
            const district = address.state.toLowerCase().trim();
            const expectedShipping = district.includes('rajshahi') ? 50 : 100;
            
            return providedShippingPrice === expectedShipping;
        };

        // Check if shipping price is correct for the district
        if (!validateShippingPrice(shippingAddress, shippingPrice)) {
            const district = shippingAddress?.state?.toLowerCase().trim() || '';
            const correctShipping = district.includes('rajshahi') ? 50 : 100;
            return res.status(400).json({ 
                message: `Invalid shipping price. For ${shippingAddress?.state || 'this district'}, shipping should be ৳${correctShipping}` 
            });
        }

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get order by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const Order = require('../models/orderModel');
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name price images');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns this order or is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to view this order' });
        }

        // Map backend fields to frontend expected fields for consistency
        const mappedOrder = {
            ...order.toObject(),
            status: order.orderStatus || order.status, // Map orderStatus to status for frontend compatibility
            shippingAddress: {
                ...order.shippingAddress,
                // Ensure address field is available
                address: order.shippingAddress?.street || order.shippingAddress?.address,
                postalCode: order.shippingAddress?.zipCode || order.shippingAddress?.postalCode,
                phone: order.shippingAddress?.phone,
                name: order.shippingAddress?.name,
                email: order.shippingAddress?.email
            }
        };

        res.json(mappedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order to paid
router.put('/:id/pay', protect, async (req, res) => {
    try {
        const Order = require('../models/orderModel');
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this order' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get logged in user orders
router.get('/user/myorders', protect, async (req, res) => {
    console.log('GET /user/myorders - Request received for user:', req.user._id);
    try {
        const Order = require('../models/orderModel');
        
        // First check if there are any orders at all
        const totalOrders = await Order.countDocuments();
        console.log('Total orders in database:', totalOrders);
        
        // Then check for this specific user
        const userOrderCount = await Order.countDocuments({ user: req.user._id });
        console.log('Orders for user', req.user._id, ':', userOrderCount);
        
        const orders = await Order.find({ user: req.user._id })
            .populate('orderItems.product', 'name images')
            .sort({ createdAt: -1 });

        console.log('GET /user/myorders - Found orders:', orders.length);
        console.log('Sample order structure:', orders[0] ? JSON.stringify(orders[0], null, 2) : 'No orders');
        
        // Map backend fields to frontend expected fields for consistency
        const mappedOrders = orders.map(order => ({
            ...order.toObject(),
            status: order.orderStatus || order.status, // Map orderStatus to status for frontend compatibility
            shippingAddress: {
                ...order.shippingAddress,
                // Ensure address field is available
                address: order.shippingAddress?.street || order.shippingAddress?.address,
                postalCode: order.shippingAddress?.zipCode || order.shippingAddress?.postalCode,
                phone: order.shippingAddress?.phone,
                name: order.shippingAddress?.name,
                email: order.shippingAddress?.email
            }
        }));
        
        res.json(mappedOrders);
    } catch (error) {
        console.error('GET /user/myorders - Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Admin routes

// Get all orders
router.get('/', protect, admin, async (req, res) => {
    try {
        const Order = require('../models/orderModel');
        const orders = await Order.find({})
            .populate('user', 'id name email')
            .populate('orderItems.product', 'name')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order to delivered
router.put('/:id/deliver', protect, admin, async (req, res) => {
    try {
        const Order = require('../models/orderModel');
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.isDelivered = true;
        // Note: isPaid, paidAt, deliveredAt, and orderStatus will be automatically set by Mongoose middleware

        const updatedOrder = await order.save();
        
        console.log(`Order ${order._id} marked as delivered. Auto-updated: isPaid=${updatedOrder.isPaid}, orderStatus=${updatedOrder.orderStatus}`);
        
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const Order = require('../models/orderModel');
        const { orderStatus } = req.body;
        
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.orderStatus = orderStatus;

        // If status is 'Delivered', also set isDelivered to true
        // Note: isPaid, paidAt, and deliveredAt will be automatically set by Mongoose middleware
        if (orderStatus === 'Delivered') {
            order.isDelivered = true;
        }

        const updatedOrder = await order.save();
        
        console.log(`Order ${order._id} status updated to ${orderStatus}. Auto-updated fields: isPaid=${updatedOrder.isPaid}, isDelivered=${updatedOrder.isDelivered}`);
        
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel order
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const Order = require('../models/orderModel');
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns this order or is admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to cancel this order' });
        }

        // Can only cancel if not delivered
        if (order.isDelivered) {
            return res.status(400).json({ message: 'Cannot cancel delivered order' });
        }

        order.orderStatus = 'Cancelled';
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
