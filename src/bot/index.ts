import { type SceneSessionData } from "@bot/helpers";
import { BOT_TOKEN } from "@configs/index";
import i18n from "@i18n/i18n";
import { getSubscriptions } from "@services/subscription.service";
import logger from "@utils/logger";
import add from "@utils/p-queue";
import { Scenes, session, Telegraf, type TelegramError } from "telegraf";

import { useRouting } from "./commands";
import { getMainKeyboard } from "./keyboards";
import historyScene from "./scenes/history";
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
  historyScene,
]);

bot.use(session());
bot.use(stage.middleware());
useRouting(bot);

bot.hears(/(.*?)/, async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Default handler has fired");
  const { mainKeyboard } = getMainKeyboard(ctx);

  await add(
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
  messages: string[],
  options?: any,
  errorCb?: (error: TelegramError) => Promise<any>,
): Promise<void> {
  for (const message of messages) {
    await add(
      async () => await bot.telegram.sendMessage(chatId, message, options),
      async (error) => await errorCb?.(error),
    );
  }
}

export async function notifiMessage(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  let subs: any[] | null = await getSubscriptions();
  if (subs && "payload" in ctx && typeof ctx.payload === "string") {
    const message = ctx.payload.trim();
    subs = subs.map((s: any) => s.user_id);
    const ids = new Set(subs);

    for (const id of ids) {
      await sendMessage(id, [message], {
        parse_mode: "HTML",
        disable_notification: true,
      });
    }
  }
}
