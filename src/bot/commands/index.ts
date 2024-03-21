import { type SceneSessionData } from "@bot/helpers";
import i18n from "@i18n/i18n";
import logger from "@utils/logger";
import queue from "@utils/p-queue";
import { type Scenes } from "telegraf";

import { getMainKeyboard } from "../keyboards";

export async function start(ctx: Scenes.SceneContext<SceneSessionData>): Promise<void> {
  logger.debugWithCtx(ctx, "Start command for bot");
  const { mainKeyboard } = getMainKeyboard(ctx);

  queue.add(async () => await ctx.reply(i18n.t("other.start"), mainKeyboard));
}

export async function info(ctx: Scenes.SceneContext<SceneSessionData>): Promise<void> {
  logger.debugWithCtx(ctx, "Start command for bot");
  const { mainKeyboardSubGuild, mainKeyboardSubServer, mainKeyboardUnsub } =
    getMainKeyboard(ctx);

  queue.add(
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

export async function subserver(ctx: Scenes.SceneContext<SceneSessionData>): Promise<void> {
  queue.add(async () => await ctx.scene.enter("sub-server"));
}

export async function subguild(ctx: Scenes.SceneContext<SceneSessionData>): Promise<void> {
  queue.add(async () => await ctx.scene.enter("sub-guild"));
}

export async function unsub(ctx: Scenes.SceneContext<SceneSessionData>): Promise<void> {
  queue.add(async () => await ctx.scene.enter("unsub"));
}
