import { checkOnStopWords, type SceneSessionData } from "@bot/helpers";
import { getBackToMenuKeyboard } from "@bot/keyboards";
import { FRACTION_NAMES, SERVER_NAMES } from "@configs/archeage";
import i18n from "@i18n/i18n";
import { type Player } from "@interfaces/player.interface";
import {
  findPlayersByName,
  getPlayersCountByName,
} from "@services/player.service";
import logger from "@utils/logger";
import add from "@utils/p-queue";
import { Markup, type Scenes } from "telegraf";
import { type InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

const PAGE_LIMIT = 15;

async function getListButtons(
  playerCount: number,
  playerName: string,
  page: number = 1,
): Promise<InlineKeyboardButton[][]> {
  const maxPages = Math.ceil(playerCount / PAGE_LIMIT);

  const { backToMenuButton } = getBackToMenuKeyboard();
  const buttons = [
    playerCount <= PAGE_LIMIT
      ? []
      : [
          Markup.button.callback(
            page <= 1
              ? i18n.t("scenes.search-player.pagination-disabled")
              : i18n.t("scenes.search-player.prev"),
            page <= 1 ? `disabled` : `page:${page - 1}:${playerName}`,
          ),
          Markup.button.callback(`${page}/${maxPages}`, "disabled"),
          Markup.button.callback(
            page >= maxPages
              ? i18n.t("scenes.search-player.pagination-disabled")
              : i18n.t("scenes.search-player.next"),
            page >= maxPages ? `disabled` : `page:${page + 1}:${playerName}`,
          ),
        ],
    [backToMenuButton],
  ];

  return buttons;
}

function parseText(players: Player[], username: string, count: number): string {
  const playerList = players
    .map((p) => {
      const name = i18n.t("scenes.search-player.player-name", { name: p.name });
      const guild = p.guild
        ? i18n.t("scenes.search-player.player-guild", { guild: p.guild })
        : "";
      const info = i18n.t("scenes.search-player.player-info", {
        fraction: FRACTION_NAMES[p.fraction],
        server: SERVER_NAMES[p.server],
        score: p.score,
      });
      return name + guild + info;
    })
    .join("\n");
  const intro = i18n.t("scenes.search-player.search-intro", {
    username,
    count,
  });
  const outro = i18n.t("scenes.search-player.search-outro");

  return intro + playerList + outro;
}

export async function findPlayer(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  const { backToMenuInlineKeyboard, backToMenuButton } =
    getBackToMenuKeyboard(ctx);

  await add(async () => await ctx.deleteMessage());
  await add(async () => {
    if (ctx.scene.session.state.messageId !== 0) {
      const message = await ctx.deleteMessage(
        ctx.scene.session.state.messageId,
      );
      ctx.scene.session.state.messageId = 0;
      return message;
    }
  });
  if (ctx.message != undefined && "text" in ctx.message) {
    const playerName = ctx.message.text.trim();
    if (checkOnStopWords(playerName)) {
      return;
    }

    const page = 1;
    logger.debugWithCtx(
      ctx,
      `Looking for player "${playerName}", page ${page}`,
    );
    const playerCount = await getPlayersCountByName(playerName);
    if (playerCount > 0) {
      const buttons = await getListButtons(playerCount, playerName, page);
      const players = await findPlayersByName(playerName, PAGE_LIMIT, page);
      const parsedPlayers = parseText(players, playerName, playerCount);

      await add(
        async () =>
          await ctx.reply(parsedPlayers, {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: buttons,
            },
          }),
      );
    } else {
      await add(
        async () =>
          await ctx.reply(
            i18n.t("scenes.search-player.not-found", { username: playerName }),
            {
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [[backToMenuButton]],
              },
            },
          ),
      );
    }
  } else {
    await add(
      async () =>
        await ctx.reply(
          i18n.t("scenes.search-player.not-found"),
          backToMenuInlineKeyboard,
        ),
    );
  }
}

export async function sendAnotherPage(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  const callbackQuery =
    ctx.callbackQuery != undefined && "data" in ctx.callbackQuery
      ? ctx.callbackQuery?.data
      : "";
  const [, pageString, ...playerString] = callbackQuery.split(":");
  const page = Number(pageString);
  const playerName = playerString.join(":");

  logger.debugWithCtx(ctx, `Looking for player "${playerName}", page ${page}`);
  const playerCount = await getPlayersCountByName(playerName);
  const buttons = await getListButtons(playerCount, playerName, page);
  const players = await findPlayersByName(playerName, PAGE_LIMIT, page);
  const parsedPlayers = parseText(players, playerName, playerCount);

  await add(
    async () =>
      await ctx.editMessageText(parsedPlayers, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: buttons,
        },
      }),
  );
}
