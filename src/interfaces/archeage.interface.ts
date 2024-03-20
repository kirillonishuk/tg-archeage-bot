import {
  type FRACTION_NAME_CODES,
  type SERVER_NAME_CODES,
} from "@configs/archeage";
import { type Player } from "@interfaces/player.interface";

export interface URLPlayerListResponse {
  error: boolean;
  message?: string;
  data: {
    heroes: GamePlayerList;
    candidates: GamePlayerList;
  };
}

export interface ServerPlayerList {
  [FRACTION_NAME_CODES.Pirates]: Player[];
  [FRACTION_NAME_CODES.West]: Player[];
  [FRACTION_NAME_CODES.East]: Player[];
}

export interface GamePlayerList {
  [SERVER_NAME_CODES.Lucij]: ServerPlayerList;
  [SERVER_NAME_CODES.Korvus]: ServerPlayerList;
  [SERVER_NAME_CODES.Fanem]: ServerPlayerList;
  [SERVER_NAME_CODES.Shaeda]: ServerPlayerList;
  [SERVER_NAME_CODES.Ifnir]: ServerPlayerList;
  [SERVER_NAME_CODES.Ksanatos]: ServerPlayerList;
  [SERVER_NAME_CODES.Taron]: ServerPlayerList;
  [SERVER_NAME_CODES.Rejven]: ServerPlayerList;
  [SERVER_NAME_CODES.Nagashar]: ServerPlayerList;
}
