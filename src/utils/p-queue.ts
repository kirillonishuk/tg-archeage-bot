import logger from "@utils/logger";
import PQueue from "p-queue";
import { TelegramError } from "telegraf";

const queue = new PQueue({
  concurrency: 1,
  timeout: 50,
});

export default async function add(
  fn: () => Promise<any>,
  errorCb?: (error: TelegramError) => Promise<any>,
): Promise<any> {
  await queue.add(async () => {
    try {
      await fn();
    } catch (error) {
      logger.error("Queue error", error);
      if (errorCb && error instanceof TelegramError) {
        await errorCb(error);
      }
    }
  });
}
