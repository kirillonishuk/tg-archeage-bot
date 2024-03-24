/* eslint-disable simple-import-sort/imports, import/first, n/no-path-concat */
import moduleAlias from "module-alias";
moduleAlias.addAliases({
  "@configs": `${__dirname}/configs`,
  "@parser": `${__dirname}/parser`,
  "@models": `${__dirname}/models`,
  "@store": `${__dirname}/store`,
  "@utils": `${__dirname}/utils`,
  "@interfaces": `${__dirname}/interfaces`,
  "@services": `${__dirname}/services`,
  "@bot": `${__dirname}/bot`,
  "@i18n": `${__dirname}/i18n`,
});

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
  closeDatabaseConnection();
});

void start();
