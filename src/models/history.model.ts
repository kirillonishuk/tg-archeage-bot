import {
  FRACTION_NAME_CODES,
  PLAYER_STATUS,
  SERVER_NAME_CODES,
} from "@configs/archeage";
import { model, Schema } from "mongoose";

const HistorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  guild: {
    type: String,
    required: false,
  },
  num: {
    type: Number,
    required: true,
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
  guild_status: {
    type: String,
    enum: PLAYER_STATUS,
  },
  fraction_status: {
    type: String,
    enum: PLAYER_STATUS,
  },
  prev_guild: {
    type: String,
    required: false,
  },
  prev_fraction: {
    type: String,
    required: false,
  },
  pretty_text: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    require: true,
  },
});

const History = model("History", HistorySchema);

export default History;
