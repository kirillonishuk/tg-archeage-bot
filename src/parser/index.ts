import "moment/locale/ru";

import { sendMessage } from "@bot/index";
import {
  FRACTION_NAME_CODES,
  LOCALE,
  SERVER_NAMES,
  URL_PLAYER_LIST,
} from "@configs/archeage";
import {
  type GamePlayerList,
  type ServerPlayerList,
  type URLPlayerListResponse,
} from "@interfaces/archeage.interface";
import { type History } from "@interfaces/player.interface";
import { saveHistory } from "@services/history.service";
import {
  deletePlayers,
  findPlayersByServer,
  resetPlayersScore,
  saveNewPlayers,
  savePlayers,
  updatePlayers,
  updatePlayersScore,
} from "@services/player.service";
import {
  deleteSubscription,
  getServerGuildSubscriptions,
  getServerSubscriptions,
} from "@services/subscription.service";
import { compareCharacters, splitCandidatesByFractions } from "@utils/compare";
import logger from "@utils/logger";
import { prettyText } from "@utils/pretty";
import { shouldResetScore, shouldSendUpdates } from "@utils/time";
import i18next from "i18next";
import moment from "moment";
import fetch from "node-fetch";
import { type TelegramError } from "telegraf";

moment.locale(LOCALE);

const LINES_IN_MESSAGE = 20;

export const processPlayers = async (): Promise<void> => {
  try {
    logger.debug("Started 'processPlayers'");
    const candidates = await fetchPlayers();

    if (candidates != undefined && typeof candidates !== "string") {
      let server: keyof GamePlayerList;

      if (shouldResetScore()) {
        logger.debug("Reset all score");
        await resetPlayersScore();
      }
      logger.debug("Compare players changes");
      logger.debug(`Send notifications ${shouldSendUpdates()}`);
      for (server in candidates) {
        const history = await parseCandidates(server, candidates[server]);
        if (shouldSendUpdates()) {
          await sendNotifications(server, history);
        }
      }
    }
    logger.debug("Finished 'processPlayers'");
  } catch (error) {
    logger.error("processPlayers error: ", error);
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
    logger.error("fetchPlayers error: ", error);
  }
};

const parseCandidates = async (
  server: keyof GamePlayerList,
  candidates: ServerPlayerList,
): Promise<History[] | undefined> => {
  try {
    const serverCandidates = await findPlayersByServer(server);

    if (serverCandidates.length != 0) {
      let [pirates, west, east] = splitCandidatesByFractions(candidates);
      pirates = pirates
        ? pirates.map((player) => ({
            ...player,
            fraction: FRACTION_NAME_CODES.Pirates,
            server,
          }))
        : [];
      west = west
        ? west.map((player) => ({
            ...player,
            fraction: FRACTION_NAME_CODES.West,
            server,
          }))
        : [];
      east = east
        ? east.map((player) => ({
            ...player,
            fraction: FRACTION_NAME_CODES.East,
            server,
          }))
        : [];

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

const unsubForBlockedUsers =
  (subscribeId: string) => async (error: TelegramError) => {
    if (error.code === 403) {
      await deleteSubscription(subscribeId);
    }
  };

const sendNotifications = async (
  server: string,
  history?: History[],
): Promise<void> => {
  try {
    if (history != undefined && history.length > 0) {
      const availableHistory = history
        .sort((a, b) => Number(b.score) - Number(a.score))
        .map((line) =>
          line.pretty_text ? `❗️ ${line.pretty_text}` : line.pretty_text,
        )
        .filter((prettyText) => prettyText);

      const serverSubscriptions = await getServerSubscriptions(server);
      if (serverSubscriptions && serverSubscriptions.length > 0) {
        let notificationText: string[] = [];
        if (availableHistory.length > LINES_IN_MESSAGE) {
          for (
            let index = 0, path = 1;
            index < availableHistory.length;
            index += LINES_IN_MESSAGE, path++
          ) {
            const header = `🌐 <b>${i18next.t("notification.server-header")} <i>${SERVER_NAMES[server]} ${i18next.t("notification.path")} ${path} ${moment().utcOffset(180).format("HH:mm DD.MM.YY")}:</i></b>\n\n`;

            const parsedHistory = availableHistory
              .slice(index, index + LINES_IN_MESSAGE)
              .join("\n");

            notificationText.push(header + parsedHistory);
          }
        } else {
          const header = `🌐 <b>${i18next.t("notification.server-header")} <i>${SERVER_NAMES[server]} ${moment().utcOffset(180).format("HH:mm DD.MM.YY")}:</i></b>\n\n`;

          const parsedHistory = availableHistory.join("\n");

          notificationText.push(header + parsedHistory);
        }

        const notificationOptions = {
          parse_mode: "HTML",
          disable_notification: false,
        };
        for (const subscription of serverSubscriptions) {
          if (subscription.muted) {
            notificationOptions.disable_notification = true;
            notificationText = notificationText.map((text) => "🔕 " + text);
          }

          await sendMessage(
            subscription.user_id,
            notificationText,
            notificationOptions,
            unsubForBlockedUsers(subscription._id),
          );
        }
      }

      const guildSubscriptions = await getServerGuildSubscriptions(server);
      if (guildSubscriptions && guildSubscriptions.length > 0) {
        for (const subscription of guildSubscriptions) {
          const shouldBeNotify = history
            .filter(
              (line) =>
                line.prev_guild === subscription.guild ||
                line.guild === subscription.guild,
            )
            .sort((a, b) => Number(b.score) - Number(a.score))
            .map((line) =>
              line.pretty_text ? `❗️ ${line.pretty_text}` : line.pretty_text,
            )
            .filter((prettyText) => prettyText);

          if (!shouldBeNotify.length) {
            continue;
          }
          const muteEmoji = subscription.muted ? "🔕 " : "";
          const notificationText: string[] = [];
          if (shouldBeNotify.length > LINES_IN_MESSAGE) {
            for (
              let index = 0, path = 1;
              index < shouldBeNotify.length;
              index += 20, path++
            ) {
              const header = `👑 <b>${i18next.t("notification.guild-header")} <i>${subscription.guild} ${i18next.t("notification.path")} ${path} ${moment().utcOffset(180).format("HH:mm DD.MM.YY")}:</i></b>\n\n`;

              const parsedHistory = shouldBeNotify
                .slice(index, index + LINES_IN_MESSAGE)
                .join("\n");

              notificationText.push(muteEmoji + header + parsedHistory);
            }
          } else {
            const header = `👑 <b>${i18next.t("notification.guild-header")} <i>${subscription.guild} ${moment().utcOffset(180).format("HH:mm DD.MM.YY")}:</i></b>\n\n`;

            const parsedHistory = shouldBeNotify.join("\n");

            notificationText.push(muteEmoji + header + parsedHistory);
          }

          const notificationOptions = {
            parse_mode: "HTML",
            disable_notification: subscription.muted,
          };

          await sendMessage(
            subscription.user_id,
            notificationText,
            notificationOptions,
            unsubForBlockedUsers(subscription._id),
          );
        }
      }
    }
  } catch (error) {
    logger.error("sendNotifications error: ", error);
  }
};
