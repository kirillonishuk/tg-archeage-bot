import { DB_DATABASE, DB_HOST, DB_PORT } from "@configs/index";
import logger from "@utils/logger";
import { connect, disconnect } from "mongoose";

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
