import fetch from "node-fetch";
import moment from "moment";

import {
  type URLPlayerListResponse,
  type GamePlayerList,
  type ServerPlayerList,
} from "@interfaces/archeage.interface";

import {
  deletePlayers,
  findPlayersByServer,
  saveNewPlayers,
  savePlayers,
  updatePlayers,
} from "@services/player.service";
import { saveHistory } from "@services/history.service";
import { compareCharacters, splitCandidatesByFractions } from "@utils/compare";
import { prettyText } from "@utils/pretty";
import { processError } from "@utils/error";

import {
  SERVER_NAMES,
  URL_PLAYER_LIST,
  FRACTION_NAME_CODES,
} from "@configs/archeage";

export const processPlayers = async (): Promise<void> => {
  console.log("Started process data:", moment().format("HH:mm:ss MM.DD.YY"));
  const candidates = await fetchPlayers();

  if (candidates !== undefined && typeof candidates !== "string") {
    let server: keyof GamePlayerList;
    for (server in candidates) {
      await parseCandidates(server, candidates[server]);
    }
  }
};

const fetchPlayers = async (): Promise<GamePlayerList | string | undefined> => {
  try {
    const response = await fetch(URL_PLAYER_LIST, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    const result = (await response.json()) as URLPlayerListResponse;

    if (result.error) {
      throw new Error(`Error! message: ${result.message}`);
    }

    return result.data.candidates;
  } catch (error) {
    processError(error);
  }
};

const parseCandidates = async (
  server: keyof GamePlayerList,
  candidates: ServerPlayerList,
): Promise<void> => {
  try {
    const serverCandidates = await findPlayersByServer(server);

    if (serverCandidates.length !== 0) {
      console.log("-------- UPDATING --------");
      console.log(`-------- SERVER ${SERVER_NAMES[server]} --------`);

      let [pirates, west, east] = splitCandidatesByFractions(candidates);
      pirates = pirates.map((player) => ({
        ...player,
        fraction: FRACTION_NAME_CODES.Pirates,
        server,
      }));
      west = west.map((player) => ({
        ...player,
        fraction: FRACTION_NAME_CODES.West,
        server,
      }));
      east = east.map((player) => ({
        ...player,
        fraction: FRACTION_NAME_CODES.East,
        server,
      }));

      let [newPlayers, disappearedPlayers, changedPlayers, history] =
        compareCharacters(serverCandidates, pirates.concat(west, east));

      history = prettyText(history, server);
      await saveHistory(history);

      await saveNewPlayers(newPlayers);
      await deletePlayers(disappearedPlayers);
      await updatePlayers(changedPlayers);
    } else {
      console.log("-------- DB IS EMPTY --------");
      await savePlayers(candidates, server);
    }
  } catch (error) {
    processError(error);
  }
};
