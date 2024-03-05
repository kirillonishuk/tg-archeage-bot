import { BaseScene, type SceneContext } from "telegraf/scenes";

import { getMainKeyboard } from "@bot/keyboards";
import {
  getServerListButton,
  subscribeOnServer,
  muteSubscribe,
} from "@bot/helpers/sub-server";
import { leaveToMainScene } from "@bot/helpers";
import i18n from "@i18n/i18n";

const subServer = new BaseScene<SceneContext>("sub-server");

subServer.enter(async (ctx: SceneContext) => {
  const serverListButtons = await getServerListButton(ctx);

  await ctx.reply(
    i18n.t("scenes.sub-server.list_of_servers"),
    serverListButtons,
  );
});

subServer.action(/go_to_menu/, leaveToMainScene);
subServer.action(/server_/, subscribeOnServer);
subServer.action(/mute_/, muteSubscribe);

subServer.leave(async (ctx: SceneContext) => {
  const { mainKeyboard } = getMainKeyboard(ctx);

  await ctx.reply(i18n.t("scenes.main.message"), mainKeyboard);
});

export default subServer;
