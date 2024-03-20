import { connect, disconnect } from "mongoose";

import logger from "@utils/logger";

import { DB_HOST, DB_PORT, DB_DATABASE } from "@configs/index";

export const dbConnection = {
  url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

export const connectToDatabase = async (): Promise<any> => {
  await connect(dbConnection.url);
  logger.debug("Connected to MongoDB");
};

export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await disconnect();
    logger.debug("Disconnected from MongoDB");
  } catch (error) {
    logger.error("Error closing database connection:", error);
  }
};
