export const LOCALE = "ru";

export const UPDATE_INTERVAL = 60;

export const HISTORY_CHECK_SIZE = 510;

export const URL_PLAYER_LIST =
  "https://archeage.ru/dynamic/rank/?a=heroes_data";

export const SUBSCRIBE_COLLECTION_NAME = "subscribes";

type Names = Record<string, string>;

export const BUTTON_IN_LINE = 3;

export const SERVER_NAMES: Names = {
  "1": "Луций",
  "42": "Корвус",
  "45": "Фанем",
  "46": "Шаеда",
  "49": "Ифнир",
  "61": "Ксанатос",
  "62": "Тарон",
  "63": "Рейвен",
  "64": "Нагашар",
};

export const FRACTION_NAMES: Names = {
  "114": "Охотники за удачей",
  "148": "Союз Нуи",
  "149": "Харнийский союз",
};

export enum FRACTION_NAME_CODES {
  Pirates = "114",
  West = "148",
  East = "149",
}

export enum SERVER_NAME_CODES {
  Lucij = "1",
  Korvus = "42",
  Fanem = "45",
  Shaeda = "46",
  Ifnir = "49",
  Ksanatos = "61",
  Taron = "62",
  Rejven = "63",
  Nagashar = "64",
}

export enum PLAYER_STATUS {
  Leave = "leave",
  Stay = "stay",
  Join = "join",
}

export enum SUBSCRIPTION_TYPE {
  Server = "server",
  Guild = "guild",
}
