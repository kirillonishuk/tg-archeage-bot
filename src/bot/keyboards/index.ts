/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Markup } from "telegraf";
import { type SceneContext } from "telegraf/scenes";
import i18n from "@i18n/i18n";

export const getMainKeyboard = (ctx?: SceneContext) => {
  const mainKeyboardProfile = i18n.t("keyboards.main.profile");
  const mainKeyboardSubGuild = i18n.t("keyboards.main.sub_guild");
  const mainKeyboardSubServer = i18n.t("keyboards.main.sub_server");
  const mainKeyboardUnsub = i18n.t("keyboards.main.unsub");
  let mainKeyboard: any = Markup.keyboard([
    [mainKeyboardSubGuild, mainKeyboardSubServer],
    [mainKeyboardUnsub],
  ]);
  mainKeyboard = mainKeyboard.resize();

  return {
    mainKeyboardProfile,
    mainKeyboardSubGuild,
    mainKeyboardSubServer,
    mainKeyboardUnsub,
    mainKeyboard,
  };
};

export const getBackKeyboard = (ctx?: SceneContext) => {
  const backKeyboardBack = i18n.t("keyboards.back.back");
  let backKeyboard: any = Markup.keyboard([backKeyboardBack]);

  backKeyboard = backKeyboard.resize();

  return {
    backKeyboard,
    backKeyboardBack,
  };
};

export const getBackToMenuKeyboard = (ctx?: SceneContext) => {
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
