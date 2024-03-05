import { type SceneContext } from "telegraf/scenes";

import { BUTTON_IN_LINE } from "@configs/archeage";

export function splitArrayToMatrix(
  array: any[],
  additionalButton?: any,
): any[][] {
  const matrix: any[][] = [];

  for (let i = 0; i < array.length; i += BUTTON_IN_LINE) {
    matrix.push(array.slice(i, i + BUTTON_IN_LINE));
  }
  if (additionalButton !== null) {
    matrix.push([additionalButton]);
  }
  return matrix;
}

export const leaveToMainScene = async (ctx: SceneContext): Promise<void> => {
  await ctx.scene.leave();
};
