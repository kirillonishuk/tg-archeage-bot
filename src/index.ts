import "module-alias/register";

import { connectToDatabase, closeDatabaseConnection } from "./databases";
// import { processPlayers } from "@parser/index";
// import { scheduleFunction } from "@utils/schedule";

import { launchBot } from "@bot/index";

const start = async (): Promise<void> => {
  try {
    await connectToDatabase();
    await launchBot();
    // scheduleFunction(processPlayers)
  } catch (error) {
    console.log("unexpected error: ", error);
  }
};

process.on("exit", () => {
  closeDatabaseConnection().catch((error) => {
    console.log("unexpected error: ", error);
  });
});

void start();
