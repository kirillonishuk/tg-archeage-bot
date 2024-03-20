import { type SceneSessionData } from "@bot/helpers";
import { getBackToMenuKeyboard } from "@bot/keyboards";
import { SERVER_NAMES } from "@configs/archeage";
import i18n from "@i18n/i18n";
import { type Subscription } from "@interfaces/player.interface";
import {
  deleteSubscription,
  getSubscriptionById,
  getUserSubscriptions,
} from "@services/subscription.service";
import queue from "@utils/p-queue";
import { Markup, type Scenes } from "telegraf";
import { type InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

import { splitArrayToMatrix } from ".";

function getSubscriptionName(subscription: Subscription): string {
  const muted = subscription.muted ? "🔇" : "🔊";
  return subscription.guild != null
    ? `${subscription.guild} - ${SERVER_NAMES[subscription.server]} ${muted}`
    : `${SERVER_NAMES[subscription.server]} ${muted}`;
}

export async function getSubscriptionButtons(
  ctx: Scenes.SceneContext<SceneSessionData>,
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
      2,
    ),
  );
}

export async function unsubscribe(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  const subscribeId =
    ctx.callbackQuery != undefined && "data" in ctx.callbackQuery
      ? ctx.callbackQuery?.data
      : "";
  const _id = subscribeId.replace(/unsub_/i, "");
  const subscription = await getSubscriptionById(_id);
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard(ctx);

  if (subscription != undefined) {
    await deleteSubscription(_id);

    const subscriptionListButtons = await getSubscriptionButtons(ctx);
    if (subscriptionListButtons != null) {
      queue.add(
        async () =>
          await ctx.telegram.editMessageText(
            ctx.chat?.id,
            ctx.scene.session.state.messageId,
            undefined,
            i18n.t("scenes.unsub.list_of_subs"),
            subscriptionListButtons,
          ),
      );
    } else {
      queue.add(
        async () => await ctx.deleteMessage(ctx.scene.session.state.messageId),
      );
      queue.add(
        async () =>
          await ctx.reply(
            i18n.t("scenes.unsub.empty_list"),
            backToMenuInlineKeyboard,
          ),
      );
    }
  } else {
    queue.add(
      async () =>
        await ctx.reply(
          i18n.t("scenes.unsub.not_found"),
          backToMenuInlineKeyboard,
        ),
    );
  }
}
