import { checkOnStopWords, type SceneSessionData } from "@bot/helpers";
import { geContinueKeyboard, getBackToMenuKeyboard } from "@bot/keyboards";
import { SERVER_NAMES } from "@configs/archeage";
import i18n from "@i18n/i18n";
import { findPlayersByGuildName } from "@services/player.service";
import {
  createSubscribeOnGuild,
  getUserGuildSubscriptions,
  muteSubscription,
} from "@services/subscription.service";
import queue from "@utils/p-queue";
import { type Types } from "mongoose";
import { Markup, type Scenes } from "telegraf";
import { type InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

export async function getGuildListButton(
  guildList: any[],
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<Markup.Markup<InlineKeyboardMarkup>> {
  const userSubscriptions = await getUserGuildSubscriptions(ctx.from?.id);

  const { backToMenuButton } = getBackToMenuKeyboard();

  const buttons = guildList.map(({ serverNumber, guildName, playerCount }) => {
    const alreadySubscribed = userSubscriptions?.find(
      (sub) => sub.server === serverNumber && sub.guild === guildName,
    );

    const subscribed = alreadySubscribed ? "✅" : "";
    const muted = alreadySubscribed
      ? alreadySubscribed.muted
        ? "🔇"
        : "🔊"
      : "";

    return [
      Markup.button.callback(
        `${subscribed} ${muted} ${guildName} - ${SERVER_NAMES[serverNumber]}(${i18n.t("scenes.sub-guild.members")}: ${playerCount})`,
        `guild_${serverNumber}_${guildName}`,
      ),
    ];
  });

  buttons.push([backToMenuButton]);

  return Markup.inlineKeyboard(buttons);
}

export async function processGuildButtons(
  ctx: Scenes.SceneContext<SceneSessionData>,
  guildName: string,
): Promise<Markup.Markup<InlineKeyboardMarkup> | undefined> {
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard(ctx);
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

  const PlayersInGuildsCounter = players.reduce<Record<string, number>>(
    (acc, { server, guild }) => {
      if (acc[`${server}_${guild}`] === undefined) {
        acc[`${server}_${guild}`] = 1;
      } else {
        acc[`${server}_${guild}`]++;
      }
      return acc;
    },
    {},
  );

  const PlayersInGuildsCounterArray = Object.entries(PlayersInGuildsCounter)
    .map(([serverAndGuildName, playerCount]) => {
      const [serverNumber, guildName] = serverAndGuildName.split("_");

      return {
        serverNumber,
        guildName,
        playerCount,
      };
    })
    .sort((prev, next) => next.playerCount - prev.playerCount);

  const guildButtons = await getGuildListButton(
    PlayersInGuildsCounterArray,
    ctx,
  );

  return guildButtons;
}

export function getMuteButton(
  subscriptionId: Types.ObjectId | string,
): Markup.Markup<InlineKeyboardMarkup> {
  const { continueButton } = geContinueKeyboard();

  return Markup.inlineKeyboard([
    Markup.button.callback(
      i18n.t("scenes.sub-guild.muteButton"),
      `mute_${subscriptionId.toString()}`,
    ),
    continueButton,
  ]);
}

export async function findGuildToSubscribe(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard(ctx);

  if (ctx.message != undefined && "text" in ctx.message) {
    const guildName = ctx.message.text.trim();
    if (checkOnStopWords(guildName)) {
      return;
    }
    ctx.scene.session.state.guildName = guildName;
    const guildButtons = await processGuildButtons(ctx, guildName);

    if (guildButtons !== undefined) {
      queue.add(async () => {
        const message = await ctx.reply(
          i18n.t("scenes.sub-guild.list_of_guild"),
          guildButtons,
        );
        ctx.scene.session.state.messageId = message.message_id;
      });
    }
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
  ctx: Scenes.SceneContext<SceneSessionData>,
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
  const guildButtons = await processGuildButtons(
    ctx,
    ctx.scene.session.state.guildName,
  );

  if (typeof userSubscription === "string") {
    queue.add(
      async () =>
        await ctx.editMessageText(
          i18n.t(`scenes.sub-guild.${userSubscription}`),
          guildButtons,
        ),
    );
  } else {
    queue.add(
      async () =>
        await ctx.editMessageText(
          i18n.t("scenes.sub-guild.list_of_guild"),
          guildButtons,
        ),
    );
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

  if (updateResult === undefined || updateResult == null) {
    queue.add(
      async () =>
        await ctx.reply(
          i18n.t("scenes.other.error_handler"),
          backToMenuInlineKeyboard,
        ),
    );
  } else {
    const guildButtons = await processGuildButtons(
      ctx,
      ctx.scene.session.state.guildName,
    );
    queue.add(
      async () =>
        await ctx.deleteMessage(ctx.callbackQuery?.message?.message_id),
    );
    queue.add(
      async () =>
        await ctx.telegram.editMessageText(
          ctx.chat?.id,
          ctx.scene.session.state.messageId,
          undefined,
          i18n.t("scenes.sub-guild.list_of_guild"),
          guildButtons,
        ),
    );
  }
}
