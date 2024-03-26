import { useRouting } from "@bot/commands";
import { type SceneSessionData } from "@bot/helpers";
import { findPlayer, sendAnotherPage } from "@bot/helpers/search-player";
import { getBackToMenuKeyboard } from "@bot/keyboards";
import i18n from "@i18n/i18n";
import logger from "@utils/logger";
import add from "@utils/p-queue";
import { Scenes } from "telegraf";

const searchPlayerScene = new Scenes.BaseScene<
  Scenes.SceneContext<SceneSessionData>
>("search-player");

searchPlayerScene.enter(async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Enter search-player scene");
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard();

  add(async () => await ctx.deleteMessage());
  add(async () => {
    const message = await ctx.reply(
      i18n.t("scenes.search-player.start"),
      backToMenuInlineKeyboard,
    );
    ctx.scene.session.state.messageId = message.message_id;
  });
});

useRouting(searchPlayerScene);

searchPlayerScene.on("text", findPlayer);

searchPlayerScene.action(/page:/, sendAnotherPage);
searchPlayerScene.action(/disabled/, () => {});

searchPlayerScene.leave(async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Leave sub-guild scene");
});

export default searchPlayerScene;
