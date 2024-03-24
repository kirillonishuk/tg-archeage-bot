import {
  type FRACTION_NAME_CODES,
  type PLAYER_STATUS,
  type SERVER_NAME_CODES,
} from "@configs/archeage";

export interface Player {
  _id: string;
  num: number;
  name: string;
  guild: string | null;
  score: string;
  fraction: FRACTION_NAME_CODES;
  server: SERVER_NAME_CODES;
  updatedAt: Date;
  createdAt: Date;
}

export interface History {
  _id?: string;
  name: string;
  guild: string | null;
  num: number;
  score: string;
  fraction: FRACTION_NAME_CODES;
  server: SERVER_NAME_CODES;
  guild_status: PLAYER_STATUS;
  fraction_status: PLAYER_STATUS;
  prev_guild?: string | null;
  prev_fraction?: FRACTION_NAME_CODES | null;
  pretty_text?: string;
  createdAt: Date;
}

export interface Subscription {
  _id: string;
  user_id: number;
  server: SERVER_NAME_CODES;
  guild: string | null;
  muted: boolean;
  createdAt: Date;
}
