import { Markup } from "telegraf";
import { type SceneContext } from "telegraf/scenes";
import { type InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { type Types } from "mongoose";

import { splitArrayToMatrix } from ".";
import {
  getUserServersSubscriptions,
  createSubscribeOnServer,
  muteSubscription,
} from "@services/subscription.service";
import { getBackToMenuKeyboard } from "@bot/keyboards";
import i18n from "@i18n/i18n";

import { SERVER_NAMES } from "@configs/archeage";

export async function getServerListButton(
  ctx: SceneContext,
): Promise<Markup.Markup<InlineKeyboardMarkup>> {
  const userSubscriptions = await getUserServersSubscriptions(ctx.from?.id);

  const { backToMenuButton } = getBackToMenuKeyboard();

  return Markup.inlineKeyboard(
    splitArrayToMatrix(
      Object.keys(SERVER_NAMES).map((key) => {
        const alreadySubscribed = userSubscriptions?.find(
          (sub) => sub.server === key,
        );
        return Markup.button.callback(
          `${alreadySubscribed != null ? "✅" : ""}${SERVER_NAMES[key]}`,
          `server_${key}`,
        );
      }),
      backToMenuButton,
    ),
  );
}

export function getMuteButton(
  subscriptionId: Types.ObjectId,
): Markup.Markup<InlineKeyboardMarkup> {
  const { backToMenuButton } = getBackToMenuKeyboard();

  return Markup.inlineKeyboard([
    Markup.button.callback(
      i18n.t("scenes.sub-server.muteButton"),
      `mute_${subscriptionId.toString()}`,
    ),
    backToMenuButton,
  ]);
}

export async function subscribeOnServer(ctx: SceneContext): Promise<void> {
  const server =
    ctx.callbackQuery !== undefined && "data" in ctx.callbackQuery
      ? ctx.callbackQuery?.data
      : "";
  const serverNumber = server.replace(/server_/i, "");
  const userSubscription = await createSubscribeOnServer(
    ctx.from?.id,
    serverNumber,
  );

  if (typeof userSubscription === "string") {
    const serverButtons = await getServerListButton(ctx);
    await ctx.reply(
      i18n.t(`scenes.sub-server.${userSubscription}`),
      serverButtons,
    );
  } else {
    await ctx.reply(
      i18n.t("scenes.sub-server.subscribed", {
        server: SERVER_NAMES[serverNumber],
      }),
    );
    await ctx.reply(
      i18n.t("scenes.sub-server.wantMute"),
      getMuteButton(userSubscription._id),
    );
  }
}

export async function muteSubscribe(ctx: SceneContext): Promise<void> {
  const subscribeIdString =
    ctx.callbackQuery !== undefined && "data" in ctx.callbackQuery
      ? ctx.callbackQuery?.data
      : "";
  const subscribeId = subscribeIdString.replace(/mute_/i, "");
  const updateResult = await muteSubscription(subscribeId);
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard(ctx);

  if (updateResult === undefined || updateResult == null) {
    await ctx.reply(
      i18n.t("scenes.other.error_handler"),
      backToMenuInlineKeyboard,
    );
  } else {
    await ctx.reply(
      i18n.t("scenes.sub-server.muted", {
        server: SERVER_NAMES[updateResult.server],
      }),
      backToMenuInlineKeyboard,
    );
  }
}
