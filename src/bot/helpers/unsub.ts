import { Markup } from 'telegraf';
import { SceneContext } from 'telegraf/scenes';

import { getBackToMenuKeyboard } from '@bot/keyboards';
import { getUserSubscriptions, deleteSubscription, getSubscriptionById } from '@services/subscription.service';
import i18n from '@i18n/i18n';

import { SERVER_NAMES, BUTTON_IN_LINE } from '@configs/archeage';

function splitArrayToMatrix(array: any[]): any[][] {
  const matrix: any[][] = [];

  for (let i = 0; i < array.length; i += (BUTTON_IN_LINE - 1)) {
    matrix.push(array.slice(i, i + (BUTTON_IN_LINE - 1)));
  };
  return matrix;
};

export async function getSubscriptionButtons(ctx: SceneContext) {
  const userSubscriptions = await getUserSubscriptions(ctx.from?.id);

  if (!userSubscriptions || !userSubscriptions.length) {
    return null
  };
  return Markup.inlineKeyboard(
    splitArrayToMatrix(
      userSubscriptions
        .map((sub) => {
          return Markup.button.callback(SERVER_NAMES[sub.server], `unsub_${sub._id}`)
        }))
  );
};

export async function unsubscribe(ctx: SceneContext) {
  const subscribeId = (ctx.callbackQuery && 'data' in ctx.callbackQuery) ? ctx.callbackQuery?.data : '';
  const _id = subscribeId.replace(/unsub_/i, '');
  const subscription = await getSubscriptionById(_id);

  const { backToMenuKeyboard } = getBackToMenuKeyboard(ctx);

  if (subscription) {
    await deleteSubscription(_id);
    const label = subscription.guild ?
      `${i18n.t('scenes.unsub.guild')} ${subscription.guild}(${i18n.t('scenes.unsub.server')}${SERVER_NAMES[subscription.server]})`
      : `${i18n.t('scenes.unsub.server')} ${SERVER_NAMES[subscription.server]}`;
    await ctx.reply(i18n.t('scenes.unsub.unsubed', { info: label }));

    const subscriptionListButtons = await getSubscriptionButtons(ctx);
    if (subscriptionListButtons) {
      await ctx.reply(i18n.t('scenes.unsub.list_of_subs'), subscriptionListButtons);
      await ctx.reply(i18n.t('scenes.unsub.back_info'), backToMenuKeyboard);
    } else {
      await ctx.reply(i18n.t('scenes.unsub.empty_list'), backToMenuKeyboard);
    };
  } else {
    await ctx.reply(i18n.t('scenes.unsub.not_found'), backToMenuKeyboard);
  }

};
