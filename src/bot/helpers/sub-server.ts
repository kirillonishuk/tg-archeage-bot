import { Markup } from 'telegraf';
import { SceneContext } from 'telegraf/scenes';

import { getUserServersSubscriptions, createSubscribeOnServer } from '@services/subscription.service';
import i18n from '@i18n/i18n';

import { SERVER_NAMES, BUTTON_IN_LINE } from '@configs/archeage';

function splitArrayToMatrix(array: any[]): any[][] {
  const matrix: any[][] = [];

  for (let i = 0; i < array.length; i += BUTTON_IN_LINE) {
    matrix.push(array.slice(i, i + BUTTON_IN_LINE));
  };
  return matrix;
};

export async function getServerListButton(ctx: SceneContext) {
  const userSubscriptions = await getUserServersSubscriptions(ctx.from?.id);

  return Markup.inlineKeyboard(
    splitArrayToMatrix(
      Object
        .keys(SERVER_NAMES)
        .map((key) => {
          const alreadySubscribed = userSubscriptions?.find(sub => sub.server === key)
          return Markup.button.callback(`${alreadySubscribed ? '✅' : ''}${SERVER_NAMES[key]}`, `server_${key}`)
        }))
  );
};

export async function subscribeOnServer(ctx: SceneContext) {
  const server = (ctx.callbackQuery && 'data' in ctx.callbackQuery) ? ctx.callbackQuery?.data : '';
  const serverNumber = server.replace(/server_/i, '');
  const userSubscription = await createSubscribeOnServer(ctx.from?.id, serverNumber);

  if (typeof userSubscription === 'string') {
    const serverButtons = await getServerListButton(ctx);
    await ctx.reply(i18n.t(`scenes.sub-server.${userSubscription}`), serverButtons);
  } else {
    await ctx.reply(i18n.t('scenes.sub-server.subscribed', { server: SERVER_NAMES[serverNumber] }));
    await ctx.scene.leave();
  };
};
