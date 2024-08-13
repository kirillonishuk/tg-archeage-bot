/* eslint-disable simple-import-sort/imports, import/first, n/no-path-concat */
import moduleAlias from "module-alias";
moduleAlias.addAliases({
  "@configs": `${process.cwd()}/src/configs`,
  "@parser": `${process.cwd()}/src/parser`,
  "@models": `${process.cwd()}/src/models`,
  "@store": `${process.cwd()}/src/store`,
  "@utils": `${process.cwd()}/src/utils`,
  "@interfaces": `${process.cwd()}/src/interfaces`,
  "@services": `${process.cwd()}/src/services`,
  "@bot": `${process.cwd()}/src/bot`,
  "@i18n": `${process.cwd()}/src/i18n`,
});
import { isMainThread, parentPort } from "worker_threads";

import { processPlayers } from "./index";

import { connectToDatabase, closeDatabaseConnection } from "../databases";

if (!isMainThread) {
  parentPort?.on("message", async (data) => {
    await connectToDatabase();
    await processPlayers();
    await closeDatabaseConnection();
  });
}
