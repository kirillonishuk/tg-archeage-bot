import { GamePlayerList, ServerPlayerList } from '@interfaces/archeage.interface';
import { Player } from '@interfaces/player.interface';

import playerModel from '@models/player.model';

import { splitCandidatesByFractions } from '@utils/compare';

import { FRACTION_NAME_CODES } from '@configs/archeage';

const player = playerModel;

export const findAllPlayer = async (): Promise<Player[]> => {
  const users: Player[] = await player.find();

  return users;
};

export const findPlayerByNameAndServer = async (name: string, server: string) => {
  const findPlayer: Player[] = await player.find({ name, server });
  if (!findPlayer) throw new Error('Player doesn\'t exist');

  return findPlayer;
};

export const findPlayersByServer = async (server: string): Promise<Player[]> => {
  const findPlayers: Player[] = await player.find({ server });
  if (!findPlayers) throw new Error('Player doesn\'t exist');

  return findPlayers;
};

export const savePlayers = async (players: ServerPlayerList, server: keyof GamePlayerList) => {
  console.log('-------- SAVE PLAYERS --------');
  let [pirates, west, east] = splitCandidatesByFractions(players);

  pirates = pirates.map(player => ({
    ...player,
    server: server,
    fraction: FRACTION_NAME_CODES.Pirates
  }));

  west = west.map(player => ({
    ...player,
    server: server,
    fraction: FRACTION_NAME_CODES.West
  }));

  east = east.map(player => ({
    ...player,
    server: server,
    fraction: FRACTION_NAME_CODES.East
  }));

  const pirateResult = player.insertMany(pirates);
  const westResult = player.insertMany(west);
  const eastResult = player.insertMany(east);

  return await Promise.all([pirateResult, westResult, eastResult]);
};

export const saveNewPlayers = async (players: Player[]) => {
  return await player.insertMany(players);
};

export const updatePlayers = async (players: Player[]) => {
  for (let playerData of players) {
    await player.findByIdAndUpdate(playerData._id, {
      fraction: playerData.fraction,
      guild: playerData.guild,
      score: playerData.score,
      num: playerData.num
    });
  };
};

export const deletePlayers = async (players: Player[]) => {
  const playerdId = players.map(player => player._id);

  return await player.deleteMany({ _id: { $in: playerdId } });
};
