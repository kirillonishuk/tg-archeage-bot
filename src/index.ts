import "module-alias/register";

import { launchBot } from "@bot/index";
import { processPlayers } from "@parser/index";
import logger from "@utils/logger";
import { scheduleFunction } from "@utils/schedule";

import { closeDatabaseConnection, connectToDatabase } from "./databases";

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
