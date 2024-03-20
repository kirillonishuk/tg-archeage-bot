import { Markup, type Scenes } from "telegraf";
import { type InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { type Types } from "mongoose";

import {
  muteSubscription,
  createSubscribeOnGuild,
  getSubscriptionById,
} from "@services/subscription.service";
import { findPlayersByGuildName } from "@services/player.service";
import { getBackToMenuKeyboard } from "@bot/keyboards";
import i18n from "@i18n/i18n";
import queue from "@utils/p-queue";

import { SERVER_NAMES } from "@configs/archeage";

export function getGuildListButton(
  serverList: any[],
  guildNames: any,
): Markup.Markup<InlineKeyboardMarkup> {
  const { backToMenuButton } = getBackToMenuKeyboard();

  const buttons = serverList.map(({ serverNumber, playerCount }) => [
    Markup.button.callback(
      `${guildNames[serverNumber]} - ${SERVER_NAMES[serverNumber]}(${i18n.t("scenes.sub-guild.members")}: ${playerCount})`,
      `guild_${serverNumber}_${guildNames[serverNumber]}`,
    ),
  ]);

  buttons.push([backToMenuButton]);

  return Markup.inlineKeyboard(buttons);
}

export function getMuteButton(
  subscriptionId: Types.ObjectId | string,
): Markup.Markup<InlineKeyboardMarkup> {
  const { backToMenuButton } = getBackToMenuKeyboard();

  return Markup.inlineKeyboard([
    Markup.button.callback(
      i18n.t("scenes.sub-guild.muteButton"),
      `mute_${subscriptionId.toString()}`,
    ),
    backToMenuButton,
  ]);
}

export async function findGuildToSubscribe(
  ctx: Scenes.SceneContext,
): Promise<void> {
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard(ctx);

  if (ctx.message != undefined && "text" in ctx.message) {
    const guildName = ctx.message.text.trim();
    const players = await findPlayersByGuildName(guildName);

    if (players.length === 0) {
      queue.add(
        async () =>
          await ctx.reply(
            i18n.t("scenes.sub-guild.guild_not_found"),
            backToMenuInlineKeyboard,
          ),
      );
      return;
    }

    const guildNameOnServer: any = {};

    const PlayersInGuildsCounter = players.reduce<Record<string, number>>(
      (acc, { server, guild }) => {
        if (acc[server] === undefined) {
          guildNameOnServer[server] = guild;
          acc[server] = 1;
        } else {
          acc[server]++;
        }
        return acc;
      },
      {},
    );

    const PlayersInGuildsCounterArray = Object.entries(
      PlayersInGuildsCounter,
    ).map(([server, playerCount]) => ({
      serverNumber: server,
      playerCount,
    }));

    queue.add(
      async () =>
        await ctx.reply(
          i18n.t("scenes.sub-guild.list_of_guild"),
          getGuildListButton(PlayersInGuildsCounterArray, guildNameOnServer),
        ),
    );
  } else {
    queue.add(
      async () =>
        await ctx.reply(
          i18n.t("scenes.sub-guild.guild_not_found"),
          backToMenuInlineKeyboard,
        ),
    );
  }
}

export async function subscribeOnGuild(
  ctx: Scenes.SceneContext,
): Promise<void> {
  const server =
    ctx.callbackQuery != undefined && "data" in ctx.callbackQuery
      ? ctx.callbackQuery?.data
      : "";
  const [, serverNumber, guildName] = server.split("_");
  const userSubscription = await createSubscribeOnGuild(
    ctx.from?.id,
    serverNumber,
    guildName,
  );
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard(ctx);

  if (typeof userSubscription === "string") {
    queue.add(
      async () =>
        await ctx.reply(
          i18n.t(`scenes.sub-guild.${userSubscription}`),
          backToMenuInlineKeyboard,
        ),
    );
  } else {
    queue.add(
      async () =>
        await ctx.reply(
          i18n.t("scenes.sub-guild.subscribed", {
            data: `${guildName} - ${SERVER_NAMES[serverNumber]}`,
          }),
          getMuteButton(userSubscription._id),
        ),
    );
  }
}

export async function muteSubscribe(ctx: Scenes.SceneContext): Promise<void> {
  const subscribeIdString =
    ctx.callbackQuery != undefined && "data" in ctx.callbackQuery
      ? ctx.callbackQuery?.data
      : "";
  const [, subscribeId] = subscribeIdString.split("_");
  const subscription = await getSubscriptionById(subscribeId);
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard(ctx);

  if (subscription != null) {
    await muteSubscription(subscribeId);
    queue.add(
      async () =>
        await ctx.reply(
          i18n.t("scenes.sub-guild.muted", {
            data: `${subscription.guild} - ${SERVER_NAMES[subscription.server]}`,
          }),
          backToMenuInlineKeyboard,
        ),
    );
  }
  if (subscription == null) {
    queue.add(
      async () =>
        await ctx.reply(
          i18n.t("scenes.other.error_handler"),
          backToMenuInlineKeyboard,
        ),
    );
  }
}
