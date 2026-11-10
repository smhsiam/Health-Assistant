require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');

const secret = process.env.JWT_SECRET || '';

if (secret.length < 32 || secret.startsWith('change_this')) {
  console.error('Set a long random JWT_SECRET in server/.env');
  process.exit(1);
}

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await testConnection();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Could not connect to the database:', error.message);
    process.exit(1);
  }
};

start();