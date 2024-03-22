import {
  DB_AUTHDB,
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from "@configs/index";
import logger from "@utils/logger";
import { connect, type ConnectOptions, disconnect } from "mongoose";

export const dbUrl = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
export const dbConnection: ConnectOptions = {
  auth: {
    username: DB_USER,
    password: DB_PASSWORD,
  },
  authSource: DB_AUTHDB,
};

export const connectToDatabase = async (): Promise<any> => {
  await connect(dbUrl, dbConnection);
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
