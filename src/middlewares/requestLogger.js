const morgan = require('morgan');
const config = require('../config/config');

// Configure logging format based on environment
const format = config.NODE_ENV === 'development' 
  ? 'dev' // Detailed format for development
  : 'combined'; // Standard format for production

module.exports = morgan(format); 