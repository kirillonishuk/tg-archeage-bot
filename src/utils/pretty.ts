import moment from "moment";
import "moment/locale/ru";

import {
  type GamePlayerList,
  type ServerPlayerList,
} from "@interfaces/archeage.interface";
import { type History } from "@interfaces/player.interface";

import {
  SERVER_NAMES,
  FRACTION_NAMES,
  LOCALE,
  PLAYER_STATUS,
} from "@configs/archeage";

moment.locale(LOCALE);

const resolveFraction = (fraction: keyof ServerPlayerList): string =>
  FRACTION_NAMES[fraction];

export const prettyText = (
  changes: History[],
  server: keyof GamePlayerList,
): History[] => {
  return changes
    .filter((player) => player.num <= 450)
    .map((player) => {
      let action: string = "";

      if (player.fraction_status === PLAYER_STATUS.Join) {
        action = `присоединился к фракции "${resolveFraction(player.fraction)}"`;
        if (player.guild !== null) {
          action += ` и гильдии "${player.guild}"`;
        }
      } else if (
        player.fraction_status === PLAYER_STATUS.Leave &&
        player.prev_fraction != null
      ) {
        action = `покинул фракцию "${resolveFraction(player.prev_fraction)}"`;
        if (player.guild !== null) {
          action += ` и гильдию "${player.guild}"`;
        }
      } else if (player.guild_status === PLAYER_STATUS.Join) {
        action = `вступил в гильдию "${player.guild}"`;
      } else if (player.guild_status === PLAYER_STATUS.Leave) {
        action = `покинул гильдию "${player.prev_guild}"`;
      }
      return {
        ...player,
        pretty_text: `${SERVER_NAMES[server]}: ${player.name}(${player.score} военки) ${action}. ${moment(player.createdAt).format("HH:mm:ss MM.DD.YY")}`,
      };
    });
};
