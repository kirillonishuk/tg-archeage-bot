import "module-alias/register";

import { connectToDatabase, closeDatabaseConnection } from "./databases";
import { processPlayers } from "@parser/index";
import { scheduleFunction } from "@utils/schedule";

import { launchBot } from "@bot/index";
import logger from "@utils/logger";

const start = async (): Promise<void> => {
  try {
    await connectToDatabase();
    scheduleFunction(processPlayers);
    await launchBot();
  } catch (error) {
    logger.error("Unexpected Start error: ", error);
  }
};

process.on("exit", () => {
  closeDatabaseConnection().catch((error) => {
    logger.error("Unexpected Exit error: ", error);
  });
});

void start();
