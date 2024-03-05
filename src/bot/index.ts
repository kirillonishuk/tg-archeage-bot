import { Telegraf, session } from "telegraf";
import { type SceneContext, Stage } from "telegraf/scenes";

import subServerScene from "./scenes/sub-server";
import subGuildScene from "./scenes/sub-guild";
import unsubScene from "./scenes/unsub";
import { leaveToMainScene } from "./helpers";
import { getMainKeyboard } from "./keyboards";
import i18n from "@i18n/i18n";

import { BOT_TOKEN } from "@configs/index";

const bot = new Telegraf<SceneContext>(BOT_TOKEN);

const stage = new Stage<SceneContext>([
  subServerScene,
  subGuildScene,
  unsubScene,
]);
bot.use(session());
bot.use(stage.middleware());

bot.hears(/(.*Подписаться на сервер)/, async (ctx: SceneContext) => {
  await ctx.scene.enter("sub-server");
});
bot.hears(/(.*Подписаться на гильдию)/, async (ctx: SceneContext) => {
  await ctx.scene.enter("sub-guild");
});
bot.hears(/(.*Отписаться от уведомлений)/, async (ctx: SceneContext) => {
  await ctx.scene.enter("unsub");
});
bot.action(/go_to_menu/, leaveToMainScene);
bot.hears(/(.*?)/, async (ctx: SceneContext) => {
  const { mainKeyboard } = getMainKeyboard(ctx);
  await ctx.reply(i18n.t("other.default_handler"), mainKeyboard);
});

bot.catch((error: any) => {
  console.error("Global error has happened", error);
});

export async function launchBot(): Promise<void> {
  await bot.launch();
}
