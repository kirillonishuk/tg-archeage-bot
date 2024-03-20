import { Scenes } from "telegraf";

import { getBackToMenuKeyboard, getMainKeyboard } from "@bot/keyboards";
import {
  findGuildToSubscribe,
  muteSubscribe,
  subscribeOnGuild,
} from "@bot/helpers/sub-guild";
import { leaveToMainScene } from "@bot/helpers";
import i18n from "@i18n/i18n";
import queue from "@utils/p-queue";
import logger from "@utils/logger";

const subGuild = new Scenes.BaseScene<Scenes.SceneContext>("sub-guild");

subGuild.enter(async (ctx: Scenes.SceneContext) => {
  logger.debugWithCtx(ctx, "Enter sub-guild scene");
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard();

  queue.add(
    async () =>
      await ctx.reply(
        i18n.t("scenes.sub-guild.start"),
        backToMenuInlineKeyboard,
      ),
  );
});

subGuild.leave(async (ctx: Scenes.SceneContext) => {
  logger.debugWithCtx(ctx, "Leave sub-guild scene");
  const { mainKeyboard } = getMainKeyboard(ctx);

  queue.add(
    async () => await ctx.reply(i18n.t("scenes.main.message"), mainKeyboard),
  );
});

subGuild.on("text", findGuildToSubscribe);

subGuild.action(/go_to_menu/, leaveToMainScene);
subGuild.action(/guild_/, subscribeOnGuild);
subGuild.action(/mute_/, muteSubscribe);

export default subGuild;
