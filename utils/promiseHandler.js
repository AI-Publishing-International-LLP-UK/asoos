/**
 * Promise Handler Utility for Cloud Run Services
 * Handles unhandled promise rejections and improves startup reliability
 */

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection at:', promise, 'reason:', reason);
  // In production, we log but don't exit to maintain service availability
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  // In production environments, attempt graceful shutdown
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️  Production mode: Attempting graceful shutdown...');
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  } else {
    process.exit(1);
  }
});

// Log successful initialization
console.log('✅ Promise handler initialized for Cloud Run service');

module.exports = {
  // Export utility functions if needed
  handleAsyncError: (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
};
