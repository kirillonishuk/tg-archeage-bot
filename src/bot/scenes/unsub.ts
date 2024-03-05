import { BaseScene, type SceneContext } from "telegraf/scenes";

import { getMainKeyboard, getBackToMenuKeyboard } from "@bot/keyboards";
import { getSubscriptionButtons, unsubscribe } from "@bot/helpers/unsub";
import i18n from "@i18n/i18n";

const unsub = new BaseScene<SceneContext>("unsub");

unsub.enter(async (ctx: SceneContext) => {
  const { backToMenuKeyboard } = getBackToMenuKeyboard(ctx);

  const subscriptionListButtons = await getSubscriptionButtons(ctx);

  if (subscriptionListButtons !== null) {
    await ctx.reply(
      i18n.t("scenes.unsub.list_of_subs"),
      subscriptionListButtons,
    );
  } else {
    await ctx.reply(i18n.t("scenes.unsub.empty_list"), backToMenuKeyboard);
  }
});

unsub.action(/go_to_menu/, async (ctx: SceneContext) => {
  await ctx.scene.leave();
});
unsub.action(/unsub_/, unsubscribe);

unsub.leave(async (ctx: SceneContext) => {
  const { mainKeyboard } = getMainKeyboard(ctx);

  await ctx.reply(i18n.t("scenes.main.message"), mainKeyboard);
});

export default unsub;
