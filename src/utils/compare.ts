import { FRACTION_NAME_CODES, PLAYER_STATUS } from "@configs/archeage";
import { type ServerPlayerList } from "@interfaces/archeage.interface";
import { type History, type Player } from "@interfaces/player.interface";

export function compareCharacters(
  prev: Player[],
  next: Player[],
): [Player[], Player[], Player[], History[]] {
  const newPlayers: Player[] = [];
  const disappearedPlayers: Player[] = [];
  const changedPlayers: Player[] = [];

  const history: History[] = [];

  for (const updatedPlayer of next) {
    const changes: History = {
      name: updatedPlayer.name,
      guild: updatedPlayer.guild,
      num: updatedPlayer.num,
      score: updatedPlayer.score,
      fraction: updatedPlayer.fraction,
      server: updatedPlayer.server,
      guild_status: PLAYER_STATUS.Stay,
      fraction_status: PLAYER_STATUS.Stay,
      createdAt: new Date(),
    };
    const player = prev.find((char) => char.name === updatedPlayer.name);
    if (player === undefined) {
      changes.fraction_status = PLAYER_STATUS.Join;
      if (updatedPlayer.guild != null) {
        changes.guild_status = PLAYER_STATUS.Join;
      }
      newPlayers.push(updatedPlayer);
      history.push(changes);
    } else if (
      updatedPlayer.guild != player.guild ||
      updatedPlayer.fraction != player.fraction
    ) {
      if (updatedPlayer.guild != player.guild) {
        if (updatedPlayer.guild != null) {
          changes.guild_status = PLAYER_STATUS.Join;
        } else {
          changes.guild_status = PLAYER_STATUS.Leave;
        }
        changes.prev_guild = player.guild;
      }
      if (updatedPlayer.fraction != player.fraction) {
        changes.fraction_status = PLAYER_STATUS.Join;
        changes.prev_fraction = player.fraction;
      }
      changedPlayers.push({
        ...updatedPlayer,
        _id: player._id,
      });
      history.push(changes);
    }
  }

  for (const player of prev) {
    const updatedPlayer = next.find((char) => char.name === player.name);
    if (updatedPlayer === undefined && player.num < 500) {
      const changes: History = {
        name: player.name,
        guild: player.guild,
        num: player.num,
        score: player.score,
        fraction: player.fraction,
        server: player.server,
        guild_status: PLAYER_STATUS.Leave,
        fraction_status: PLAYER_STATUS.Leave,
        prev_fraction: player.fraction,
        prev_guild: player.guild,
        createdAt: new Date(),
      };
      disappearedPlayers.push(player);
      history.push(changes);
    }
  }

  return [newPlayers, disappearedPlayers, changedPlayers, history];
}

export function splitCandidatesByFractions(
  players: Player[],
): [Player[], Player[], Player[]];
export function splitCandidatesByFractions(
  players: ServerPlayerList,
): [Player[], Player[], Player[]];
export function splitCandidatesByFractions(
  players: Player[] | ServerPlayerList,
): [Player[], Player[], Player[]] {
  let piratePlayers: Player[], westPlayers: Player[], eastPlayers: Player[];
  if (Array.isArray(players)) {
    piratePlayers = players.filter(
      (player) => player.fraction === FRACTION_NAME_CODES.Pirates,
    );
    westPlayers = players.filter(
      (player) => player.fraction === FRACTION_NAME_CODES.West,
    );
    eastPlayers = players.filter(
      (player) => player.fraction === FRACTION_NAME_CODES.East,
    );
  } else {
    piratePlayers = players[FRACTION_NAME_CODES.Pirates];
    westPlayers = players[FRACTION_NAME_CODES.West];
    eastPlayers = players[FRACTION_NAME_CODES.East];
  }

  return [piratePlayers, westPlayers, eastPlayers];
}
