import { useRouting } from "@bot/commands";
import { type SceneSessionData } from "@bot/helpers";
import {
  getHistory,
  sendAnotherPage,
  sendServerList,
} from "@bot/helpers/history";
import logger from "@utils/logger";
import { Scenes } from "telegraf";

const historyScene = new Scenes.BaseScene<
  Scenes.SceneContext<SceneSessionData>
>("history");

historyScene.enter(sendServerList);

useRouting(historyScene);

historyScene.action(/back/, sendServerList);
historyScene.action(/server:/, getHistory);
historyScene.action(/page:/, sendAnotherPage);
historyScene.action(/disabled/, () => {});

historyScene.leave(async (ctx: Scenes.SceneContext<SceneSessionData>) => {
  logger.debugWithCtx(ctx, "Leave history scene");
});

export default historyScene;
