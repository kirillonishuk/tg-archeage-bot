import { BaseScene, type SceneContext } from "telegraf/scenes";

import { getBackToMenuKeyboard, getMainKeyboard } from "@bot/keyboards";
import {
  findGuildToSubscribe,
  muteSubscribe,
  subscribeOnGuild,
} from "@bot/helpers/sub-guild";
import { leaveToMainScene } from "@bot/helpers";
import i18n from "@i18n/i18n";

const subGuild = new BaseScene<SceneContext>("sub-guild");

subGuild.enter(async (ctx: SceneContext) => {
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard();

  await ctx.reply(i18n.t("scenes.sub-guild.start"), backToMenuInlineKeyboard);
});

subGuild.on("text", findGuildToSubscribe);

subGuild.action(/go_to_menu/, leaveToMainScene);
subGuild.action(/guild_/, subscribeOnGuild);
subGuild.action(/mute_/, muteSubscribe);

subGuild.leave(async (ctx: SceneContext) => {
  const { mainKeyboard } = getMainKeyboard(ctx);

  await ctx.reply(i18n.t("scenes.main.message"), mainKeyboard);
});

export default subGuild;
