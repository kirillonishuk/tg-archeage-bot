import { type SceneSessionData } from "@bot/helpers";
import { BOT_TOKEN } from "@configs/index";
import i18n from "@i18n/i18n";
import logger from "@utils/logger";
import queue from "@utils/p-queue";
import { Scenes, session, Telegraf } from "telegraf";

import { useRouting } from "./commands";
import { getMainKeyboard } from "./keyboards";
import searchPlayerScene from "./scenes/search-player";
import subGuildScene from "./scenes/sub-guild";
import subServerScene from "./scenes/sub-server";
import unsubScene from "./scenes/unsub";

const bot = new Telegraf<Scenes.SceneContext<SceneSessionData>>(BOT_TOKEN);

const stage = new Scenes.Stage<Scenes.SceneContext<SceneSessionData>>([
  subServerScene,
  subGuildScene,
  unsubScene,
  searchPlayerScene,
]);
bot.use(session());
bot.use(stage.middleware());
useRouting(bot);

bot.hears(/(.*?)/, async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Default handler has fired");
  const { mainKeyboard } = getMainKeyboard(ctx);

  queue.add(
    async () => await ctx.reply(i18n.t("other.default_handler"), mainKeyboard),
  );
});

bot.catch((error) => {
  logger.error("Bot error has happened", error);
});

export async function launchBot(): Promise<void> {
  await bot.launch();
}

export async function sendMessage(
  chatId: number | string,
  message: string,
  options?: any,
): Promise<void> {
  try {
    queue.add(
      async () => await bot.telegram.sendMessage(chatId, message, options),
    );
  } catch (error) {
    console.log(error);
  }
}
