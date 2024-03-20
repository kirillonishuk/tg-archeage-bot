import { type ServerPlayerList } from "@interfaces/archeage.interface";
import { type History } from "@interfaces/player.interface";

import { FRACTION_NAMES, PLAYER_STATUS } from "@configs/archeage";

const resolveFraction = (fraction: keyof ServerPlayerList): string =>
  FRACTION_NAMES[fraction];

export const prettyText = (changes: History[]): History[] => {
  return changes
    .filter((player) => player.num <= 450)
    .map((player) => {
      let action: string = "";

      if (player.fraction_status === PLAYER_STATUS.Join) {
        action = `присоединился к фракции <b>${resolveFraction(player.fraction)}</b>`;
        if (player.guild != null) {
          action += ` и гильдии <b>${player.guild}</b>`;
        }
      } else if (
        player.fraction_status === PLAYER_STATUS.Leave &&
        player.prev_fraction != null
      ) {
        action = `покинул фракцию <b>${resolveFraction(player.prev_fraction)}</b>`;
        if (player.guild != null) {
          action += ` и гильдию <b>${player.guild}</b>`;
        }
      } else if (player.guild_status === PLAYER_STATUS.Join) {
        action = `вступил в гильдию <b>${player.guild}</b>`;
      } else if (player.guild_status === PLAYER_STATUS.Leave) {
        action = `покинул гильдию <b>${player.prev_guild}</b>`;
      }
      return {
        ...player,
        pretty_text: `<u>${player.name}(${player.score} военки)</u> ${action}.`,
      };
    });
};
