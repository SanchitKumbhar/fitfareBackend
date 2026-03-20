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
    console.log('Database ensured');
    await testMySqlConnection();
    console.log('MySQL connected successfully');
    await initSchema();
    console.log('Database schema ensured');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MySQL:', error.message);
    process.exit(1);
  }
};

startServer();
