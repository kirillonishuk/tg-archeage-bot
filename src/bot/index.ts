import { type SceneSessionData } from "@bot/helpers";
import { BOT_TOKEN } from "@configs/index";
import i18n from "@i18n/i18n";
import logger from "@utils/logger";
import queue from "@utils/p-queue";
import { Scenes, session, Telegraf } from "telegraf";

import { info, start, subguild, subserver, unsub } from "./commands";
import { leaveToMainScene } from "./helpers";
import { getMainKeyboard } from "./keyboards";
import subGuildScene from "./scenes/sub-guild";
import subServerScene from "./scenes/sub-server";
import unsubScene from "./scenes/unsub";

const bot = new Telegraf<Scenes.SceneContext<SceneSessionData>>(BOT_TOKEN);

const stage = new Scenes.Stage<Scenes.SceneContext<SceneSessionData>>([
  subServerScene,
  subGuildScene,
  unsubScene,
]);
bot.use(session());
bot.use(stage.middleware());

bot.command("start", start);
bot.command("info", info);
bot.command("subserver", subserver);
bot.command("subguild", subguild);
bot.command("unsub", unsub);
bot.hears(
  /(.*Подписаться на сервер)/,
  async (ctx: Scenes.SceneContext<SceneSessionData>) => {
    queue.add(async () => await ctx.scene.enter("sub-server"));
  },
);
bot.hears(
  /(.*Подписаться на гильдию)/,
  async (ctx: Scenes.SceneContext<SceneSessionData>) => {
    queue.add(async () => await ctx.scene.enter("sub-guild"));
  },
);
bot.hears(
  /(.*Отписаться от уведомлений)/,
  async (ctx: Scenes.SceneContext<SceneSessionData>) => {
    queue.add(async () => await ctx.scene.enter("unsub"));
  },
);
bot.hears(/(.*?)/, async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Default handler has fired");
  const { mainKeyboard } = getMainKeyboard(ctx);

  queue.add(
    async () => await ctx.reply(i18n.t("other.default_handler"), mainKeyboard),
  );
});

bot.action(/go_to_menu/, leaveToMainScene);
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
