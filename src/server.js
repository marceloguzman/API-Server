const app = require('./app');
const config = require('./config/config');

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.error('UNCAUGHT ERROR! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Start the server
const server = app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
}); 