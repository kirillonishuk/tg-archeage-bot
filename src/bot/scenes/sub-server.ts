import { BaseScene, SceneContext } from 'telegraf/scenes';

import { getMainKeyboard, getBackToMenuKeyboard } from '@bot/keyboards';
import { getServerListButton, subscribeOnServer } from '@bot/helpers/sub-server';
import i18n from '@i18n/i18n';

const subServer = new BaseScene<SceneContext>('sub-server');

subServer.enter(async (ctx: SceneContext) => {
  const { backToMenuKeyboard } = getBackToMenuKeyboard(ctx);

  const serverListButtons = await getServerListButton(ctx);

  await ctx.reply(i18n.t('scenes.sub-server.list_of_servers'), serverListButtons);
  await ctx.reply(i18n.t('scenes.sub-server.back_info'), backToMenuKeyboard);
});

subServer.leave(async (ctx: SceneContext) => {
  const { mainKeyboard } = getMainKeyboard(ctx);

  await ctx.reply(i18n.t('scenes.main.message'), mainKeyboard);
});
subServer.hears(/(.*В Главное Меню)/, async (ctx: SceneContext) => await ctx.scene.leave());

subServer.action(/server/, subscribeOnServer);

export default subServer;