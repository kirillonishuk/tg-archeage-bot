import fetch from "node-fetch";
import moment from "moment";
import "moment/locale/ru";

import {
  type URLPlayerListResponse,
  type GamePlayerList,
  type ServerPlayerList,
} from "@interfaces/archeage.interface";
import { type History } from "@interfaces/player.interface";

import { sendMessage } from "@bot/index";
import {
  deletePlayers,
  findPlayersByServer,
  saveNewPlayers,
  savePlayers,
  updatePlayers,
  updatePlayersScore,
} from "@services/player.service";
import { saveHistory } from "@services/history.service";
import { getServerSubscriptions } from "@services/subscription.service";
import { compareCharacters, splitCandidatesByFractions } from "@utils/compare";
import { prettyText } from "@utils/pretty";
import logger from "@utils/logger";

import {
  SERVER_NAMES,
  URL_PLAYER_LIST,
  FRACTION_NAME_CODES,
  LOCALE,
} from "@configs/archeage";
import i18next from "i18next";

moment.locale(LOCALE);

export const processPlayers = async (): Promise<void> => {
  try {
    logger.debug("Started 'processPlayers'");
    const candidates = await fetchPlayers();

    if (candidates != undefined && typeof candidates !== "string") {
      let server: keyof GamePlayerList;
      for (server in candidates) {
        const history = await parseCandidates(server, candidates[server]);

        sendNotifications(server, history);
      }
    }
  } catch (error) {
    logger.error("processPlayers error: ", error);
  }
};

const fetchPlayers = async (): Promise<GamePlayerList | string | undefined> => {
  try {
    logger.debug("Started 'fetchPlayers'");
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
    logger.error("fetchPlayers error: ", error);
  }
};

const parseCandidates = async (
  server: keyof GamePlayerList,
  candidates: ServerPlayerList,
): Promise<History[] | undefined> => {
  try {
    logger.debug("Started 'parseCandidates' on server " + SERVER_NAMES[server]);
    const serverCandidates = await findPlayersByServer(server);

    if (serverCandidates.length != 0) {
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

      const players = pirates.concat(west, east);

      let [newPlayers, disappearedPlayers, changedPlayers, history] =
        compareCharacters(serverCandidates, players);

      history = prettyText(history);
      await saveHistory(history);

      await updatePlayersScore(players);
      await saveNewPlayers(newPlayers);
      await deletePlayers(disappearedPlayers);
      await updatePlayers(changedPlayers);

      return history;
    } else {
      await savePlayers(candidates, server);
    }
  } catch (error) {
    logger.error("parseCandidates error: ", error);
  }
};

const sendNotifications = async (
  server: string,
  history?: History[],
): Promise<void> => {
  try {
    logger.debug(
      "Started 'sendNotifications' on server " + SERVER_NAMES[server],
    );
    if (history != undefined) {
      const subscriptions = await getServerSubscriptions(server);
      if (subscriptions === null || history.length === 0) {
        return;
      }

      const header = `<b>${i18next.t("notification.server-header")} <i>${SERVER_NAMES[server]} ${moment().format("HH:mm DD.MM.YY")}:</i></b>`;

      const parsedHistory = history
        .map((line) => line.pretty_text)
        .filter((prettyText) => prettyText)
        .join("\n");
      const notificationText = header + "\n" + parsedHistory;
      const notificationOptions = {
        parse_mode: "HTML",
        disable_notification: false,
      };
      for (const subscription of subscriptions) {
        if (subscription.muted) {
          notificationOptions.disable_notification = true;
        }

        await sendMessage(
          subscription.user_id,
          notificationText,
          notificationOptions,
        );
      }
    }
  } catch (error) {
    logger.error("sendNotifications error: ", error);
  }
};
