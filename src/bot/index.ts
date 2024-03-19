import { Telegraf, session, Scenes } from "telegraf";

import subServerScene from "./scenes/sub-server";
import subGuildScene from "./scenes/sub-guild";
import unsubScene from "./scenes/unsub";
import { leaveToMainScene } from "./helpers";
import { getMainKeyboard } from "./keyboards";
import i18n from "@i18n/i18n";
import queue from "@utils/p-queue";
import logger from "@utils/logger";

import { BOT_TOKEN } from "@configs/index";

const bot = new Telegraf<Scenes.SceneContext>(BOT_TOKEN);

const stage = new Scenes.Stage<Scenes.SceneContext>([
  subServerScene,
  subGuildScene,
  unsubScene,
]);
bot.use(session());
bot.use(stage.middleware());

bot.hears(/(.*Подписаться на сервер)/, async (ctx: Scenes.SceneContext) => {
  await ctx.scene.enter("sub-server");
});
bot.hears(/(.*Подписаться на гильдию)/, async (ctx: Scenes.SceneContext) => {
  await ctx.scene.enter("sub-guild");
});
bot.hears(/(.*Отписаться от уведомлений)/, async (ctx: Scenes.SceneContext) => {
  await ctx.scene.enter("unsub");
});
bot.action(/go_to_menu/, leaveToMainScene);
bot.hears(/(.*?)/, async (ctx: Scenes.SceneContext) => {
  logger.debugWithCtx(ctx, "Default handler has fired");
  const { mainKeyboard } = getMainKeyboard(ctx);

  queue.add(
    async () =>
      await ctx.reply(i18n.t("other.default_handler"), {
        reply_markup: {
          keyboard: mainKeyboard,
          one_time_keyboard: true,
        },
      }),
  );
});

bot.catch((error: any) => {
  logger.error("Bot error has happened", error);
});

export async function launchBot(): Promise<void> {
  await bot.launch();
}

export async function send(
  chatId: number | string,
  message: string,
): Promise<void> {
  await bot.telegram.sendMessage(chatId, message);
}
