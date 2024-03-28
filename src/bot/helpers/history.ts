import { type SceneSessionData, splitArrayToMatrix } from "@bot/helpers";
import { getBackKeyboard, getBackToMenuKeyboard } from "@bot/keyboards";
import { SERVER_NAMES } from "@configs/archeage";
import i18n from "@i18n/i18n";
import { type History } from "@interfaces/player.interface";
import {
  findHistoryByServer,
  getHistoryCountByServer,
} from "@services/history.service";
import logger from "@utils/logger";
import add from "@utils/p-queue";
import moment from "moment";
import { Markup, type Scenes } from "telegraf";
import {
  type InlineKeyboardButton,
  type InlineKeyboardMarkup,
} from "telegraf/typings/core/types/typegram";

const PAGE_LIMIT = 20;

export async function getServerListKeyboard(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<Markup.Markup<InlineKeyboardMarkup>> {
  const { backToMenuButton } = getBackToMenuKeyboard();

  const serverList = Object.keys(SERVER_NAMES);
  serverList.unshift("0");

  return Markup.inlineKeyboard(
    splitArrayToMatrix(
      serverList.map((key) => {
        return Markup.button.callback(
          `${SERVER_NAMES[key] ?? i18n.t("scenes.history.all_servers")}`,
          `server:${key}`,
        );
      }),
      backToMenuButton,
      2,
    ),
  );
}

async function getHistoryButtons(
  historyCount: number,
  server: string,
  page: number = 1,
): Promise<InlineKeyboardButton[][]> {
  const maxPages = Math.ceil(historyCount / PAGE_LIMIT);

  const { backToMenuButton } = getBackToMenuKeyboard();
  const { backButton } = getBackKeyboard();
  const buttons = [
    historyCount <= PAGE_LIMIT
      ? []
      : [
          Markup.button.callback(
            page <= 1
              ? i18n.t("scenes.history.pagination-disabled")
              : i18n.t("scenes.history.prev"),
            page <= 1 ? `disabled` : `page:${server}:${page - 1}`,
          ),
          Markup.button.callback(`${page}/${maxPages}`, "disabled"),
          Markup.button.callback(
            page >= maxPages
              ? i18n.t("scenes.history.pagination-disabled")
              : i18n.t("scenes.history.next"),
            page >= maxPages ? `disabled` : `page:${server}:${page + 1}`,
          ),
        ],
    [backButton, backToMenuButton],
  ];

  return buttons;
}

export async function sendServerList(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  logger.debugWithCtx(ctx, "Enter history scene");
  const serverListButtons = await getServerListKeyboard(ctx);
  const callbackQuery =
    ctx.callbackQuery != undefined && "data" in ctx.callbackQuery
      ? ctx.callbackQuery?.data
      : "";
  if (callbackQuery) {
    await add(async () => await ctx.deleteMessage());
  }
  await add(
    async () =>
      await ctx.reply(
        i18n.t("scenes.history.list_of_servers"),
        serverListButtons,
      ),
  );
}

function parseHistory(history: History[], server: string): string {
  const intro =
    server !== "0"
      ? i18n.t("scenes.history.intro-lisr-for-server", {
          serverName: SERVER_NAMES[server],
        })
      : i18n.t("scenes.history.intro-lisr-for-all");

  return (
    intro +
    history
      .filter((h) => h.pretty_text)
      .map((h) => {
        const serverName =
          server !== "0" ? "" : `<b>${SERVER_NAMES[h.server]}:</b> `;
        return `❗️ ${serverName} ${h.pretty_text} ${moment(h.createdAt).utcOffset(180).format("HH:mm DD.MM.YY")}`;
      })
      .join("\n")
  );
}

export async function getHistory(
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> {
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard(ctx);
  await add(async () => await ctx.deleteMessage());

  const callbackQuery =
    ctx.callbackQuery != undefined && "data" in ctx.callbackQuery
      ? ctx.callbackQuery?.data
      : "";
  const [, server] = callbackQuery.split(":");
  const page = 1;

  logger.debugWithCtx(
    ctx,
    `Looking history for server "${SERVER_NAMES[server] ?? "All servers"}", page ${page}`,
  );
  const historyCount = await getHistoryCountByServer(server);
  if (historyCount > 0) {
    const buttons = await getHistoryButtons(historyCount, server, page);
    const history = await findHistoryByServer(server, PAGE_LIMIT, page);
    const parsedHistory = parseHistory(history, server);

    await add(
      async () =>
        await ctx.reply(parsedHistory, {
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
          i18n.t("scenes.history.not-found"),
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
  const [, server, pageString] = callbackQuery.split(":");
  const page = Number(pageString);

  logger.debugWithCtx(
    ctx,
    `Looking history for server "${SERVER_NAMES[server] ?? "All servers"}", page ${page}`,
  );
  const historyCount = await getHistoryCountByServer(server);
  const buttons = await getHistoryButtons(historyCount, server, page);
  const history = await findHistoryByServer(server, PAGE_LIMIT, page);
  const parsedHistory = parseHistory(history, server);

  await add(
    async () =>
      await ctx.editMessageText(parsedHistory, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: buttons,
        },
      }),
  );
}
