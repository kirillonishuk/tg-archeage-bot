import { leaveToMainScene, type SceneSessionData } from "@bot/helpers";
import { getSubscriptionButtons, unsubscribe } from "@bot/helpers/unsub";
import { getBackToMenuKeyboard, getMainKeyboard } from "@bot/keyboards";
import i18n from "@i18n/i18n";
import logger from "@utils/logger";
import queue from "@utils/p-queue";
import { Scenes } from "telegraf";

const unsub = new Scenes.BaseScene<Scenes.SceneContext<SceneSessionData>>(
  "unsub",
);

unsub.enter(async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Enter unsub scene");
  const { backToMenuInlineKeyboard } = getBackToMenuKeyboard(ctx);

  const subscriptionListButtons = await getSubscriptionButtons(ctx);

  if (subscriptionListButtons != null) {
    queue.add(async () => {
      const message = await ctx.reply(
        i18n.t("scenes.unsub.list_of_subs"),
        subscriptionListButtons,
      );
      ctx.scene.session.state.messageId = message.message_id;
    });
  } else {
    queue.add(
      async () =>
        await ctx.reply(
          i18n.t("scenes.unsub.empty_list"),
          backToMenuInlineKeyboard,
        ),
    );
  }
});

unsub.leave(async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Leave unsub scene");
  const { mainKeyboard } = getMainKeyboard(ctx);

  queue.add(
    async () => await ctx.reply(i18n.t("scenes.main.message"), mainKeyboard),
  );
});

unsub.action(/go_to_menu/, leaveToMainScene);
unsub.action(/unsub_/, unsubscribe);

export default unsub;
