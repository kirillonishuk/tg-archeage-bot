import {
  continueScene,
  leaveToMainScene,
  type SceneSessionData,
} from "@bot/helpers";
import {
  getServerListButton,
  muteSubscribe,
  subscribeOnServer,
} from "@bot/helpers/sub-server";
import { getMainKeyboard } from "@bot/keyboards";
import i18n from "@i18n/i18n";
import logger from "@utils/logger";
import queue from "@utils/p-queue";
import { Scenes } from "telegraf";

const subServer = new Scenes.BaseScene<Scenes.SceneContext<SceneSessionData>>(
  "sub-server",
);

subServer.enter(async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Enter sub-server scene");
  const serverListButtons = await getServerListButton(ctx);

  queue.add(async () => {
    const message = await ctx.reply(
      i18n.t("scenes.sub-server.list_of_servers"),
      serverListButtons,
    );
    ctx.scene.session.state.messageId = message.message_id;
  });
});

subServer.leave(async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Leave sub-server scene");
  const { mainKeyboard } = getMainKeyboard(ctx);

  queue.add(
    async () => await ctx.reply(i18n.t("scenes.main.message"), mainKeyboard),
  );
});

subServer.action(/go_to_menu/, leaveToMainScene);
subServer.action(/continue/, continueScene);
subServer.action(/server_/, subscribeOnServer);
subServer.action(/mute_/, muteSubscribe);

export default subServer;
