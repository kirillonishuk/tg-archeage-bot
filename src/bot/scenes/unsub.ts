import { Scenes } from "telegraf";

import { getMainKeyboard, getBackToMenuKeyboard } from "@bot/keyboards";
import { getSubscriptionButtons, unsubscribe } from "@bot/helpers/unsub";
import i18n from "@i18n/i18n";
import queue from "@utils/p-queue";
import logger from "@utils/logger";

const unsub = new Scenes.BaseScene<Scenes.SceneContext>("unsub");

unsub.enter(async (ctx: Scenes.SceneContext) => {
  logger.debugWithCtx(ctx, "Enter unsub scene");
  const { backToMenuKeyboard } = getBackToMenuKeyboard(ctx);

  const subscriptionListButtons = await getSubscriptionButtons(ctx);

  if (subscriptionListButtons != null) {
    queue.add(
      async () =>
        await ctx.reply(
          i18n.t("scenes.unsub.list_of_subs"),
          subscriptionListButtons,
        ),
    );
  } else {
    queue.add(
      async () =>
        await ctx.reply(i18n.t("scenes.unsub.empty_list"), backToMenuKeyboard),
    );
  }
});

unsub.leave(async (ctx: Scenes.SceneContext) => {
  logger.debugWithCtx(ctx, "Leave unsub scene");
  const { mainKeyboard } = getMainKeyboard(ctx);

  queue.add(
    async () =>
      await ctx.reply(i18n.t("scenes.main.message"), {
        reply_markup: {
          keyboard: mainKeyboard,
          one_time_keyboard: true,
        },
      }),
  );
});

unsub.action(/go_to_menu/, async (ctx: Scenes.SceneContext) => {
  await ctx.scene.leave();
});
unsub.action(/unsub_/, unsubscribe);

export default unsub;
