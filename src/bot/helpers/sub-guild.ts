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
  serverList: any[],
  guildNames: any,
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<Markup.Markup<InlineKeyboardMarkup>> {
  const userSubscriptions = await getUserGuildSubscriptions(ctx.from?.id);

  const { backToMenuButton } = getBackToMenuKeyboard();

  const buttons = serverList.map(({ serverNumber, playerCount }) => {
    const alreadySubscribed = userSubscriptions?.find(
      (sub) =>
        sub.server === serverNumber && sub.guild === guildNames[serverNumber],
    );

    const subscribed = alreadySubscribed ? "✅" : "";
    const muted = alreadySubscribed
      ? alreadySubscribed.muted
        ? "🔇"
        : "🔊"
      : "";

    return [
      Markup.button.callback(
        `${subscribed} ${guildNames[serverNumber]} - ${SERVER_NAMES[serverNumber]}(${i18n.t("scenes.sub-guild.members")}: ${playerCount}) ${muted}`,
        `guild_${serverNumber}_${guildNames[serverNumber]}`,
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

  // TODO: fix guild counter
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

  const guildButtons = await getGuildListButton(
    PlayersInGuildsCounterArray,
    guildNameOnServer,
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
      await queue.add(async () => {
        await ctx.scene.leave();
      });
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

  if (typeof userSubscription === "string" || guildButtons !== undefined) {
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
          i18n.t("scenes.sub-server.list_of_servers"),
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
          i18n.t("scenes.unsub.list_of_subs"),
          guildButtons,
        ),
    );
  }
}
