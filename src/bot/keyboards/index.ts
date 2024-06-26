/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type SceneSessionData } from "@bot/helpers";
import i18n from "@i18n/i18n";
import { Markup, type Scenes } from "telegraf";

export const getMainKeyboard = (
  ctx?: Scenes.SceneContext<SceneSessionData>,
) => {
  const mainKeyboardProfile = i18n.t("keyboards.main.profile");
  const mainKeyboardSubGuild = i18n.t("keyboards.main.sub_guild");
  const mainKeyboardSubServer = i18n.t("keyboards.main.sub_server");
  const mainKeyboardUnsub = i18n.t("keyboards.main.unsub");
  const mainKeyboardSearchPlayer = i18n.t("keyboards.main.search_player");
  const mainKeyboardHistory = i18n.t("keyboards.main.history");
  const mainKeyboard = Markup.keyboard([
    [mainKeyboardSubGuild, mainKeyboardSubServer],
    [mainKeyboardHistory, mainKeyboardUnsub],
    [mainKeyboardSearchPlayer],
  ])
    .oneTime()
    .resize();

  return {
    mainKeyboardProfile,
    mainKeyboardSubGuild,
    mainKeyboardSubServer,
    mainKeyboardUnsub,
    mainKeyboardSearchPlayer,
    mainKeyboardHistory,
    mainKeyboard,
  };
};

export const getBackKeyboard = (
  ctx?: Scenes.SceneContext<SceneSessionData>,
) => {
  const back = i18n.t("keyboards.back.back");
  const backButton = Markup.button.callback(back, "back");
  const backKeyboard = Markup.keyboard([backButton]).resize();

  return {
    back,
    backButton,
    backKeyboard,
  };
};

export const getBackToMenuKeyboard = (
  ctx?: Scenes.SceneContext<SceneSessionData>,
) => {
  const backToMenuKeyboardBack = i18n.t("keyboards.back.menu");
  const backToMenuKeyboard = Markup.keyboard([backToMenuKeyboardBack]).resize();
  const backToMenuButton = Markup.button.callback(
    backToMenuKeyboardBack,
    "go_to_menu",
  );
  const backToMenuInlineKeyboard = Markup.inlineKeyboard([backToMenuButton]);

  return {
    backToMenuKeyboard,
    backToMenuInlineKeyboard,
    backToMenuKeyboardBack,
    backToMenuButton,
  };
};

export const geContinueKeyboard = (
  ctx?: Scenes.SceneContext<SceneSessionData>,
) => {
  const continueKeyboardBack = i18n.t("keyboards.continue");
  const continueButton = Markup.button.callback(
    continueKeyboardBack,
    "continue",
  );
  const continueInlineKeyboard = Markup.inlineKeyboard([continueButton]);

  return {
    continueInlineKeyboard,
    continueKeyboardBack,
    continueButton,
  };
};
