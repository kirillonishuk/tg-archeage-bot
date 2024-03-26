import { type History } from "@interfaces/player.interface";
import historyModel from "@models/history.model";

const history = historyModel;

export const saveHistory = async (historyList: History[]): Promise<any> => {
  const pirateResult = history.insertMany(historyList);

  return await pirateResult;
};

export const findHistoryByServer = async (
  server: string,
  limit: number = 10,
  page: number = 14,
): Promise<History[]> => {
  const query: { server?: string } = {};
  if (server !== "0") {
    query.server = server;
  }
  const users: History[] = await history
    .find<History>(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  return users;
};

export const getHistoryCountByServer = async (
  server: string,
): Promise<number> => {
  const query: { server?: string } = {};
  if (server !== "0") {
    query.server = server;
  }
  const count: number = await history.find(query).countDocuments();

  return count;
};
