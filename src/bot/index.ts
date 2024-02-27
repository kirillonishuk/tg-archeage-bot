import { Telegraf, session } from 'telegraf';
import { SceneContext, Stage } from 'telegraf/scenes';

import mainScene from './scenes/main';
import subSrverScene from './scenes/sub-server';
import unsubScene from './scenes/unsub';
import { getMainKeyboard } from './keyboards';
import i18n from '@i18n/i18n';

import { BOT_TOKEN } from '@configs/index';

const bot = new Telegraf<SceneContext>(BOT_TOKEN || '');

const stage = new Stage<SceneContext>([
  mainScene,
  subSrverScene,
  unsubScene,
]);
bot.use(session());
bot.use(stage.middleware());

bot.hears(/(.*Подписаться на сервер)/, async (ctx: SceneContext) => {
  await ctx.scene.enter('sub-server');
});
bot.hears(/(.*Отписаться от уведомлений)/, async (ctx: SceneContext) => {
  await ctx.scene.enter('unsub');
});
bot.hears(/(.*Назад)/, async (ctx: SceneContext) => {
  const { mainKeyboard } = getMainKeyboard(ctx);

  await ctx.reply(i18n.t('other.default_handler'), mainKeyboard);
});
bot.hears(/(.*?)/, async (ctx: SceneContext) => {
  const { mainKeyboard } = getMainKeyboard(ctx);
  await ctx.reply(i18n.t('other.default_handler'), mainKeyboard);
});

bot.catch((error: any) => {
  console.error('Global error has happened', error);
});

bot.launch();
