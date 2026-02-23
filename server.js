require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

/**
 * Start server function with database connection
 */
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start the server after successful database connection
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🚀 ======================================
   Server is running on port ${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
   Database: Connected ✅
=======================================
      `);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n🛑 Received shutdown signal, closing connections...');
      server.close(() => {
        console.log('✅ HTTP server closed');
        mongoose.connection.close(false, () => {
          console.log('✅ MongoDB connection closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    
    // In production, you might want to retry instead of exit
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    
    // Retry logic for production
    console.log('⏰ Retrying in 5 seconds...');
    setTimeout(startServer, 5000);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();