import { getMainKeyboard } from "@bot/keyboards";
import { BUTTON_IN_LINE } from "@configs/archeage";
import i18n from "@i18n/i18n";
import queue from "@utils/p-queue";
import { type Scenes } from "telegraf";

interface SceneSessionStateData {
  messageId: number;
  guildName: string;
  searchPlayerName: string;
}

export interface SceneSessionData extends Scenes.SceneSessionData {
  state: SceneSessionStateData;
}

export function splitArrayToMatrix(
  array: any[],
  additionalButton?: any,
  buttonInLine: number = BUTTON_IN_LINE,
): any[][] {
  const matrix: any[][] = [];

  for (let i = 0; i < array.length; i += buttonInLine) {
    matrix.push(array.slice(i, i + buttonInLine));
  }
  if (additionalButton != null) {
    matrix.push([additionalButton]);
  }
  return matrix;
}

export const leaveToMainScene = async (
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> => {
  await queue.add(async () => {
    await ctx.deleteMessage();
  });
  await queue.add(async () => {
    await ctx.scene.leave();
  });
  const { mainKeyboard } = getMainKeyboard(ctx);

  queue.add(
    async () => await ctx.reply(i18n.t("scenes.main.message"), mainKeyboard),
  );
};

export const continueScene = async (
  ctx: Scenes.SceneContext<SceneSessionData>,
): Promise<void> => {
  queue.add(
    async () => await ctx.deleteMessage(ctx.callbackQuery?.message?.message_id),
  );
};

export const checkOnStopWords = (text: string): boolean => {
  const stopWords = [
    i18n.t("keyboards.main.profile"),
    i18n.t("keyboards.main.sub_guild"),
    i18n.t("keyboards.main.sub_server"),
    i18n.t("keyboards.main.unsub"),
    i18n.t("keyboards.main.search_player"),
    "/start",
    "/info",
    "/subserver",
    "/subguild",
    "/unsub",
    "/players",
  ];

  return stopWords.includes(text);
};
