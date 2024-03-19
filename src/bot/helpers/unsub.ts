import { Markup, type Scenes } from "telegraf";
import { type InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

import { splitArrayToMatrix } from ".";
import { getBackToMenuKeyboard } from "@bot/keyboards";
import {
  getUserSubscriptions,
  deleteSubscription,
  getSubscriptionById,
} from "@services/subscription.service";
import i18n from "@i18n/i18n";
import queue from "@utils/p-queue";

import { SERVER_NAMES } from "@configs/archeage";

function getSubscriptionName(subscription: any): string {
  return subscription.guild != null
    ? `${subscription.guild} - ${SERVER_NAMES[subscription.server]}`
    : SERVER_NAMES[subscription.server];
}

export async function getSubscriptionButtons(
  ctx: Scenes.SceneContext,
): Promise<Markup.Markup<InlineKeyboardMarkup> | null> {
  const userSubscriptions = await getUserSubscriptions(ctx.from?.id);
  const { backToMenuButton } = getBackToMenuKeyboard(ctx);

  if (userSubscriptions === undefined || userSubscriptions?.length === 0) {
    return null;
  }
  return Markup.inlineKeyboard(
    splitArrayToMatrix(
      userSubscriptions.map((sub) => {
        return Markup.button.callback(
          getSubscriptionName(sub),
          `unsub_${sub._id.toString()}`,
        );
      }),
      backToMenuButton,
    ),
  );
}

export async function unsubscribe(ctx: Scenes.SceneContext): Promise<void> {
  const subscribeId =
    ctx.callbackQuery != undefined && "data" in ctx.callbackQuery
      ? ctx.callbackQuery?.data
      : "";
  const _id = subscribeId.replace(/unsub_/i, "");
  const subscription = await getSubscriptionById(_id);
  const { backToMenuKeyboard } = getBackToMenuKeyboard(ctx);

  if (subscription != undefined) {
    await deleteSubscription(_id);
    const label =
      subscription.guild != null
        ? `${i18n.t("scenes.unsub.guild")} ${subscription.guild}(${i18n.t("scenes.unsub.server")}${SERVER_NAMES[subscription.server]})`
        : `${i18n.t("scenes.unsub.server")} ${SERVER_NAMES[subscription.server]}`;
    queue.add(
      async () =>
        await ctx.reply(i18n.t("scenes.unsub.unsubed", { info: label })),
    );

    const subscriptionListButtons = await getSubscriptionButtons(ctx);
    if (subscriptionListButtons != null) {
      queue.add(
        async () =>
          await ctx.reply(
            i18n.t("scenes.unsub.list_of_subs"),
            subscriptionListButtons,
          ),
      );
    } else {
      queue.add(
        async () =>
          await ctx.reply(
            i18n.t("scenes.unsub.empty_list"),
            backToMenuKeyboard,
          ),
      );
    }
  } else {
    queue.add(
      async () =>
        await ctx.reply(i18n.t("scenes.unsub.not_found"), backToMenuKeyboard),
    );
  }
}
