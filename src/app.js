const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = require('./app');
const { ensureDatabaseExists } = require('./config/bootstrapDatabase');
const { testMySqlConnection } = require('./config/mysql');
const { initSchema } = require('./config/initSchema');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await ensureDatabaseExists();
    console.log('✅ Database ensured');

    await testMySqlConnection();
    console.log('✅ MySQL connected successfully');

    await initSchema();
    console.log('✅ Database schema ensured');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();