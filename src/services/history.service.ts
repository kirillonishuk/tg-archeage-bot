import { type History } from "@interfaces/player.interface";

import historyModel from "@models/history.model";

const history = historyModel;

export const saveHistory = async (historyList: History[]): Promise<any> => {
  const pirateResult = history.insertMany(historyList);

  return await pirateResult;
};
