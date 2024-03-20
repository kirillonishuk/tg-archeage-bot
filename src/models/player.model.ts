import { FRACTION_NAME_CODES, SERVER_NAME_CODES } from "@configs/archeage";
import { type Player } from "@interfaces/player.interface";
import { type Document, model, Schema } from "mongoose";

const PlayerSchema = new Schema(
  {
    num: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    guild: {
      type: String,
      required: false,
    },
    score: {
      type: String,
      required: true,
    },
    fraction: {
      type: String,
      enum: FRACTION_NAME_CODES,
    },
    server: {
      type: String,
      enum: SERVER_NAME_CODES,
    },
  },
  {
    timestamps: true,
  },
);

const playerModel = model<Player & Document>("Player", PlayerSchema);

export default playerModel;
