import { History } from '@interfaces/player.interface';

import historyModel from '@models/history.model';

const history = historyModel;

export const saveHistory = async (historyList: History[]) => {
  const pirateResult = history.insertMany(historyList);

  return pirateResult;
};

