
require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config/env');
const testConnection = require('./src/utils/dbTest');

const startServer = async () => {
  const port = config.port;
  
  // Test DB connection first
  if (await testConnection()) {
    app.listen(port, () => {
      console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${port}`);
    });
  } else {
    console.error('❌ Server startup aborted due to database connection issues');
    process.exit(1);
  }
};

startServer();