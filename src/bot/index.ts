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

  add(
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
    add(
      async () => await bot.telegram.sendMessage(chatId, message, options),
      async (error) => errorCb && (await errorCb(error)),
    );
  }
}

export async function sorryMessage(): Promise<void> {
  let subs: any[] | null = await getSubscriptions();
  if (subs) {
    subs = subs.map((s: any) => s.user_id);
    const ids = new Set(subs);

    const message = `💤 Доброй ночи!\n\nПриношу свои извинения за спам сообщениями от бота(ошибка исправлена и больше не повторится). Проблема возникла из-за сброса военки в игре. В дальнейшем в ночь обнуления бот будет работать в тихом режиме и не отправлять уведомления до 12 утра по МСК, история будет записываться и ее можно посмотреть в соответствуещем меню бота.\n\nP.S.: Еще раз приношу свои извинения, всех благ!\n\nP.P.S.: В сообщениях в спаме инфа неверная, не обращайте на нее внимания!`;

    for (const id of ids) {
      await sendMessage(id, [message], {
        parse_mode: "HTML",
        disable_notification: true,
      });
    }
  }
}
