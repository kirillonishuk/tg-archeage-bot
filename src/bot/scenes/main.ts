import { BaseScene, SceneContext } from 'telegraf/scenes';
import { getMainKeyboard } from '../keyboards';
import i18n from '@i18n/i18n';

const main = new BaseScene<SceneContext>('main');

main.enter(async (ctx: SceneContext) => {
  const { mainKeyboard } = getMainKeyboard(ctx);
  await ctx.reply(i18n.t('scenes.main.message'), mainKeyboard);
});

main.leave(async (ctx: SceneContext) => {
  const { mainKeyboard } = getMainKeyboard(ctx);

  await ctx.reply('Bye', mainKeyboard);
});

export default main;