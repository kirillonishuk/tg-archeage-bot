import {
  type GamePlayerList,
  type ServerPlayerList,
} from "@interfaces/archeage.interface";
import { type Player } from "@interfaces/player.interface";

import playerModel from "@models/player.model";

import { splitCandidatesByFractions } from "@utils/compare";

import { FRACTION_NAME_CODES } from "@configs/archeage";

const player = playerModel;

export const findAllPlayer = async (): Promise<Player[]> => {
  const users: Player[] = await player.find();

  return users;
};

export const findPlayerByNameAndServer = async (
  name: string,
  server: string,
): Promise<Player[]> => {
  const findPlayer: Player[] = await player.find<Player>({ name, server });
  if (findPlayer === null) throw new Error("Player doesn't exist");

  return findPlayer;
};

export const findPlayersByServer = async (
  server: string,
): Promise<Player[]> => {
  const findPlayers: Player[] = await player.find({ server });
  if (findPlayers === null) throw new Error("Player doesn't exist");

  return findPlayers;
};

export const savePlayers = async (
  players: ServerPlayerList,
  server: keyof GamePlayerList,
): Promise<any> => {
  let [pirates, west, east] = splitCandidatesByFractions(players);

  pirates = pirates.map((player) => ({
    ...player,
    server,
    fraction: FRACTION_NAME_CODES.Pirates,
  }));

  west = west.map((player) => ({
    ...player,
    server,
    fraction: FRACTION_NAME_CODES.West,
  }));

  east = east.map((player) => ({
    ...player,
    server,
    fraction: FRACTION_NAME_CODES.East,
  }));

  const pirateResult = player.insertMany(pirates);
  const westResult = player.insertMany(west);
  const eastResult = player.insertMany(east);

  return await Promise.all([pirateResult, westResult, eastResult]);
};

export const saveNewPlayers = async (players: Player[]): Promise<any> => {
  return await player.insertMany(players);
};

export const updatePlayers = async (players: Player[]): Promise<any> => {
  for (const playerData of players) {
    await player.findByIdAndUpdate(playerData._id, {
      fraction: playerData.fraction,
      guild: playerData.guild,
      score: playerData.score,
      num: playerData.num,
    });
  }
};

export const updatePlayersScore = async (players: Player[]): Promise<any> => {
  for (const playerData of players) {
    await player.findOneAndUpdate(
      {
        name: playerData.name,
        server: playerData.server,
      },
      {
        score: playerData.score,
        num: playerData.num,
      },
    );
  }
};

export const deletePlayers = async (players: Player[]): Promise<any> => {
  const playerdId = players.map((player) => player._id);

  return await player.deleteMany({ _id: { $in: playerdId } });
};

export const findPlayersByGuildName = async (
  guild: string,
): Promise<Player[]> => {
  const users: Player[] = await player.find({ guild: new RegExp(guild, "i") });

  return users;
};
