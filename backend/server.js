const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Database connection
const connectDB = require('./config/database');

// Route imports
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Middleware imports
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors({
    origin: ['https://amar-nursery-project.vercel.app','http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Database connection
connectDB();

// Routes
const wishlistRoutes = require('./routes/wishlistRoutes');
app.get('/', (req, res) => {
    res.send('Hello World');
});
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = 5001; // Backend server port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
