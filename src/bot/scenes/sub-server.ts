import { Scenes } from "telegraf";

import { getMainKeyboard } from "@bot/keyboards";
import {
  getServerListButton,
  subscribeOnServer,
  muteSubscribe,
} from "@bot/helpers/sub-server";
import { leaveToMainScene } from "@bot/helpers";
import i18n from "@i18n/i18n";
import queue from "@utils/p-queue";
import logger from "@utils/logger";

const subServer = new Scenes.BaseScene<Scenes.SceneContext>("sub-server");

subServer.enter(async (ctx: Scenes.SceneContext) => {
  logger.debugWithCtx(ctx, "Enter sub-server scene");
  const serverListButtons = await getServerListButton(ctx);

  queue.add(
    async () =>
      await ctx.reply(
        i18n.t("scenes.sub-server.list_of_servers"),
        serverListButtons,
      ),
  );
});

subServer.leave(async (ctx: Scenes.SceneContext) => {
  logger.debugWithCtx(ctx, "Leave sub-server scene");
  const { mainKeyboard } = getMainKeyboard(ctx);

  queue.add(
    async () =>
      await ctx.reply(i18n.t("scenes.main.message"), {
        reply_markup: {
          keyboard: mainKeyboard,
          one_time_keyboard: true,
        },
      }),
  );
});

subServer.action(/go_to_menu/, leaveToMainScene);
subServer.action(/server_/, subscribeOnServer);
subServer.action(/mute_/, muteSubscribe);

export default subServer;
