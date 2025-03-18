const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/config');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

// Initialize Express application
const app = express();

// Security and utility middlewares
app.use(helmet()); // Improves security with HTTP headers
app.use(cors()); // Allows CORS requests
app.use(express.json()); // Parses JSON in body
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.use(requestLogger); // Request logging

// API routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to the API'
  });
});

// Route to get API information
app.get('/api/v1', (req, res) => {
  res.json({
    status: 'success',
    message: 'API v1',
    endpoints: {
      users: '/api/v1/users',
      products: '/api/v1/products'
    }
  });
});

// Handle routes not found
app.all('*', (req, res, next) => {
  const err = new Error(`Could not find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  next(err);
});

// Error handling middleware
app.use(errorHandler);

module.exports = app; 