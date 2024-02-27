import { connect, disconnect } from 'mongoose';

import { DB_HOST, DB_PORT, DB_DATABASE } from '@configs/index';

export const dbConnection = {
  url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

export const connectToDatabase = async () => {
  await connect(dbConnection.url);
  console.log('Connected to MongoDB');
};

export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error closing database connection:', error);
  };
};
