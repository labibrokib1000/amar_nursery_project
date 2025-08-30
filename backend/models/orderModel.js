const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        quantity: Number,
        image: String,
        price: Number
    }],
    shippingAddress: {
        name: String,
        email: String,
        phone: String,
        address: String,
        street: String, // Alternative field name
        Upazilla: String,
        state: String,
        postalCode: String,
        zipCode: String, // Alternative field name  
        country: String
    },
    paymentMethod: {
        type: String,
        required: [true, 'Please select payment method'],
        enum: ['cash', 'card']
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: Date,
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: Date,
    orderStatus: {
        type: String,
        required: true,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    }
}, {
    timestamps: true
});

// Middleware to automatically update payment status when order is delivered
orderSchema.pre('save', function(next) {
    // If order is being marked as delivered and payment status is not already set
    if (this.isDelivered && !this.isPaid) {
        console.log(`Auto-updating payment status for order ${this._id}: isDelivered=true, setting isPaid=true`);
        this.isPaid = true;
        
        // Set paidAt date if not already set
        if (!this.paidAt) {
            this.paidAt = new Date();
        }
    }
    
    // Set deliveredAt date when order is marked as delivered
    if (this.isDelivered && !this.deliveredAt) {
        this.deliveredAt = new Date();
    }
    
    // Also update orderStatus to 'Delivered' when isDelivered is true
    if (this.isDelivered && this.orderStatus !== 'Delivered') {
        console.log(`Auto-updating order status for order ${this._id}: setting orderStatus to 'Delivered'`);
        this.orderStatus = 'Delivered';
    }
    
    next();
});

// Middleware for findOneAndUpdate operations
orderSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    
    // Check if isDelivered is being set to true in the update
    if (update.isDelivered === true || update.$set?.isDelivered === true) {
        console.log('Auto-updating payment status in findOneAndUpdate: isDelivered=true, setting isPaid=true');
        
        // Set isPaid to true
        if (update.$set) {
            update.$set.isPaid = true;
            if (!update.$set.paidAt) {
                update.$set.paidAt = new Date();
            }
            if (!update.$set.deliveredAt) {
                update.$set.deliveredAt = new Date();
            }
            if (update.$set.orderStatus !== 'Delivered') {
                update.$set.orderStatus = 'Delivered';
            }
        } else {
            update.isPaid = true;
            if (!update.paidAt) {
                update.paidAt = new Date();
            }
            if (!update.deliveredAt) {
                update.deliveredAt = new Date();
            }
            if (update.orderStatus !== 'Delivered') {
                update.orderStatus = 'Delivered';
            }
        }
    }
    
    next();
});

module.exports = mongoose.model('Order', orderSchema);
