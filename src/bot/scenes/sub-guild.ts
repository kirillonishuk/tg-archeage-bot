import { useRouting } from "@bot/commands";
import { continueScene, type SceneSessionData } from "@bot/helpers";
import {
  findGuildToSubscribe,
  muteSubscribe,
  subscribeOnGuild,
} from "@bot/helpers/sub-guild";
import { getBackToMenuKeyboard } from "@bot/keyboards";
import i18n from "@i18n/i18n";
import logger from "@utils/logger";
import add from "@utils/p-queue";
import { Scenes } from "telegraf";

const subGuildScene = new Scenes.BaseScene<
  Scenes.SceneContext<SceneSessionData>
>("sub-guild");

subGuildScene.enter(async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Enter sub-guild scene");
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard();

  await add(async () => {
    const message = await ctx.reply(
      i18n.t("scenes.sub-guild.start"),
      backToMenuInlineKeyboard,
    );
    ctx.scene.session.state.messageId = message.message_id;
    return message;
  });
});

useRouting(subGuildScene);

subGuildScene.on("text", findGuildToSubscribe);

subGuildScene.action(/continue/, continueScene);
subGuildScene.action(/guild_/, subscribeOnGuild);
subGuildScene.action(/mute_/, muteSubscribe);

subGuildScene.leave(async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Leave sub-guild scene");
});

export default subGuildScene;
