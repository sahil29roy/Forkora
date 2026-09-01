const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify Database connection on startup
    await testConnection();

    app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 Forkora Backend API Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`==================================================\n`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL database on startup:', err.message);
    process.exit(1);
  }
}

startServer();
