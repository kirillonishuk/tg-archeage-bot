import { useRouting } from "@bot/commands";
import { continueScene, type SceneSessionData } from "@bot/helpers";
import {
  getServerListKeyboard,
  muteSubscribe,
  subscribeOnServer,
} from "@bot/helpers/sub-server";
import i18n from "@i18n/i18n";
import logger from "@utils/logger";
import add from "@utils/p-queue";
import { Scenes } from "telegraf";

const subServerScene = new Scenes.BaseScene<
  Scenes.SceneContext<SceneSessionData>
>("sub-server");

subServerScene.enter(async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Enter sub-server scene");
  const serverListButtons = await getServerListKeyboard(ctx);

  add(async () => {
    const message = await ctx.reply(
      i18n.t("scenes.sub-server.list_of_servers"),
      serverListButtons,
    );
    ctx.scene.session.state.messageId = message.message_id;
  });
});

useRouting(subServerScene);

subServerScene.action(/continue/, continueScene);
subServerScene.action(/server_/, subscribeOnServer);
subServerScene.action(/mute_/, muteSubscribe);

subServerScene.leave(async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Leave sub-server scene");
});

export default subServerScene;
