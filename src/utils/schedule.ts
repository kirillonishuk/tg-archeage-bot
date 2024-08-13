import { UPDATE_INTERVAL } from "@configs/archeage";
import path from "path";
import { isMainThread, Worker } from "worker_threads";

import logger from "./logger";

export function scheduleFunction(): void {
  if (isMainThread) {
    const workerPath = path.resolve(
      process.cwd(),
      "src",
      "parser",
      "worker.ts",
    );
    const worker = new Worker(workerPath, {
      execArgv: /\.ts$/.test(workerPath)
        ? ["--require", "ts-node/register"]
        : undefined,
    });

    worker.on("message", (data) => {
      console.log(data);
    });

    worker.on("error", (error) => {
      logger.error("Worker error", error);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        throw new Error(`Worker stopped with exit code ${code}`);
      } else {
        logger.error("Worker stopped with code " + code);
      }
    });

    const now = new Date();
    const minutes = now.getMinutes();
    const millisecondsUntilNextCall =
      (UPDATE_INTERVAL - (minutes % UPDATE_INTERVAL) + 1) * 60 * 1000;

    worker.postMessage("start");
    setTimeout(() => {
      worker.postMessage("start");
      setInterval(
        () => {
          worker.postMessage("start");
        },
        UPDATE_INTERVAL * 60 * 1000,
      );
    }, millisecondsUntilNextCall);
  }
}
