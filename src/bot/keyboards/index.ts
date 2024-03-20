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
  let mainKeyboard = Markup.keyboard([
    [mainKeyboardSubGuild, mainKeyboardSubServer],
    [mainKeyboardUnsub],
  ]);
  mainKeyboard = mainKeyboard.oneTime().resize();

  return {
    mainKeyboardProfile,
    mainKeyboardSubGuild,
    mainKeyboardSubServer,
    mainKeyboardUnsub,
    mainKeyboard,
  };
};

export const getBackKeyboard = (
  ctx?: Scenes.SceneContext<SceneSessionData>,
) => {
  const backKeyboardBack = i18n.t("keyboards.back.back");
  let backKeyboard: any = Markup.keyboard([backKeyboardBack]);

  backKeyboard = backKeyboard.resize();

  return {
    backKeyboard,
    backKeyboardBack,
  };
};

export const getBackToMenuKeyboard = (
  ctx?: Scenes.SceneContext<SceneSessionData>,
) => {
  const backToMenuKeyboardBack = i18n.t("keyboards.back.menu");
  let backToMenuKeyboard: any = Markup.keyboard([backToMenuKeyboardBack]);
  const backToMenuButton = Markup.button.callback(
    backToMenuKeyboardBack,
    "go_to_menu",
  );
  const backToMenuInlineKeyboard = Markup.inlineKeyboard([backToMenuButton]);

  backToMenuKeyboard = backToMenuKeyboard.resize();

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
