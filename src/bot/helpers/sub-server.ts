import { type SceneSessionData, splitArrayToMatrix } from "@bot/helpers";
import { geContinueKeyboard, getBackToMenuKeyboard } from "@bot/keyboards";
import { SERVER_NAMES } from "@configs/archeage";
import i18n from "@i18n/i18n";
import {
  createSubscribeOnServer,
  getUserServersSubscriptions,
  muteSubscription,
} from "@services/subscription.service";
import logger from "@utils/logger";
import add from "@utils/p-queue";
import { type Types } from "mongoose";
import { Markup, type Scenes } from "telegraf";
import { type InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

export async function getServerListKeyboard(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<Markup.Markup<InlineKeyboardMarkup>> {
  const userSubscriptions = await getUserServersSubscriptions(ctx.from?.id);

  const { backToMenuButton } = getBackToMenuKeyboard();

  return Markup.inlineKeyboard(
    splitArrayToMatrix(
      Object.keys(SERVER_NAMES).map((key) => {
        const alreadySubscribed = userSubscriptions?.find(
          (sub) => sub.server === key,
        );

        const subscribed = alreadySubscribed ? "✅" : "";
        const muted = alreadySubscribed
          ? alreadySubscribed.muted
            ? "🔇"
            : "🔊"
          : "";

        return Markup.button.callback(
          `${subscribed} ${muted} ${SERVER_NAMES[key]}`,
          `server_${key}`,
        );
      }),
      backToMenuButton,
      2,
    ),
  );
}

export function getMuteButton(
  subscriptionId: Types.ObjectId | string,
): Markup.Markup<InlineKeyboardMarkup> {
  const { continueButton } = geContinueKeyboard();

  return Markup.inlineKeyboard([
    Markup.button.callback(
      i18n.t("scenes.sub-server.muteButton"),
      `mute_${subscriptionId.toString()}`,
    ),
    continueButton,
  ]);
}

export async function subscribeOnServer(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  const server =
    ctx.callbackQuery != undefined && "data" in ctx.callbackQuery
      ? ctx.callbackQuery?.data
      : "";
  const serverNumber = server.replace(/server_/i, "");
  const userSubscription = await createSubscribeOnServer(
    ctx.from?.id,
    serverNumber,
  );
  const serverButtons = await getServerListKeyboard(ctx);

  if (typeof userSubscription === "string") {
    if (
      ctx.callbackQuery?.message != undefined &&
      "text" in ctx.callbackQuery.message &&
      ctx.callbackQuery.message.text !==
        i18n.t(`scenes.sub-server.${userSubscription}`)
    ) {
      add(
        async () =>
          await ctx.editMessageText(
            i18n.t(`scenes.sub-server.${userSubscription}`),
            serverButtons,
          ),
      );
    }
  } else {
    logger.debugWithCtx(
      ctx,
      `Subscribed on server "${SERVER_NAMES[serverNumber]}", id: ${userSubscription._id}`,
    );
    add(
      async () =>
        await ctx.editMessageText(
          i18n.t("scenes.sub-server.list_of_servers"),
          serverButtons,
        ),
    );
    add(
      async () =>
        await ctx.reply(
          i18n.t("scenes.sub-server.subscribed", {
            server: SERVER_NAMES[serverNumber],
          }),
          getMuteButton(userSubscription._id),
        ),
    );
  }
}

export async function muteSubscribe(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  const subscribeIdString =
    ctx.callbackQuery != undefined && "data" in ctx.callbackQuery
      ? ctx.callbackQuery?.data
      : "";
  const subscribeId = subscribeIdString.replace(/mute_/i, "");
  const updateResult = await muteSubscription(subscribeId);
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard(ctx);
  const serverButtons = await getServerListKeyboard(ctx);

  if (updateResult === undefined || updateResult == null) {
    add(
      async () =>
        await ctx.reply(
          i18n.t("scenes.other.error_handler"),
          backToMenuInlineKeyboard,
        ),
    );
  } else {
    logger.debugWithCtx(
      ctx,
      `Muted subscribed on server "${SERVER_NAMES[updateResult.server]}", id: ${updateResult._id}`,
    );
    add(
      async () =>
        await ctx.deleteMessage(ctx.callbackQuery?.message?.message_id),
    );
    add(
      async () =>
        await ctx.telegram.editMessageText(
          ctx.chat?.id,
          ctx.scene.session.state.messageId,
          undefined,
          i18n.t("scenes.sub-server.list_of_servers"),
          serverButtons,
        ),
    );
  }
}
