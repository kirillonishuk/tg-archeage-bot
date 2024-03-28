import { type SceneSessionData } from "@bot/helpers";
import i18n from "@i18n/i18n";
import logger from "@utils/logger";
import add from "@utils/p-queue";
import { type Scenes, type Telegraf } from "telegraf";

import { leaveToMainScene } from "../helpers";
import { sorryMessage } from "../index";
import { getMainKeyboard } from "../keyboards";

export async function useRouting(
  bot:
    | Telegraf<Scenes.SceneContext<SceneSessionData>>
    | Scenes.BaseScene<Scenes.SceneContext<SceneSessionData>>,
): Promise<void> {
  bot.command("start", start);
  bot.command("info", info);
  bot.command("subserver", subserver);
  bot.command("subguild", subguild);
  bot.command("unsub", unsub);
  bot.command("search_player", searchPlayer);
  bot.command("history", history);
  bot.command("sorry_for_spam", sorry);
  bot.hears(/(.*Подписаться на сервер)/, hearsSubOnServer);
  bot.hears(/(.*Подписаться на гильдию)/, hearsSubOnGuild);
  bot.hears(/(.*Отписаться от уведомлений)/, hearsUnsub);
  bot.hears(/(.*Поиск игроков)/, hearsSearchPlayer);
  bot.hears(/(.*История изменений)/, hearsHistory);
  bot.action(/go_to_menu/, leaveToMainScene);
}

export async function start(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  const { mainKeyboard } = getMainKeyboard(ctx);
  add(async () => await ctx.reply(i18n.t("other.start"), mainKeyboard));
}

export async function info(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  logger.debugWithCtx(ctx, "Start command for bot");
  const { mainKeyboardSubGuild, mainKeyboardSubServer, mainKeyboardUnsub } =
    getMainKeyboard(ctx);

  add(
    async () =>
      await ctx.reply(i18n.t("other.info"), {
        reply_markup: {
          keyboard: [
            [mainKeyboardSubGuild, mainKeyboardSubServer],
            [mainKeyboardUnsub],
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
        },
        parse_mode: "HTML",
      }),
  );
}

export async function subserver(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  add(async () => await ctx.scene.enter("sub-server"));
}

export async function subguild(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  add(async () => await ctx.scene.enter("sub-guild"));
}

export async function unsub(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  add(async () => await ctx.scene.enter("unsub"));
}

export async function searchPlayer(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  add(async () => await ctx.scene.enter("search-player"));
}

export async function history(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  add(async () => await ctx.scene.enter("history"));
}

export async function sorry(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  if (ctx.message?.from.id === 509210633) {
    await sorryMessage();
  }
}

export async function hearsSubOnServer(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  add(async () => await ctx.scene.enter("sub-server"));
}

export async function hearsSubOnGuild(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  add(async () => await ctx.scene.enter("sub-guild"));
}

export async function hearsUnsub(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  add(async () => await ctx.scene.enter("unsub"));
}

export async function hearsSearchPlayer(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  add(async () => await ctx.scene.enter("search-player"));
}

export async function hearsHistory(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  add(async () => await ctx.scene.enter("history"));
}
