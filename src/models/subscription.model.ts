import { SERVER_NAME_CODES } from "@configs/archeage";
import { model, Schema } from "mongoose";

const SubscriptionSchema = new Schema({
  user_id: {
    type: Number,
    required: true,
  },
  server: {
    type: String,
    enum: SERVER_NAME_CODES,
    required: true,
  },
  guild: {
    type: String,
    required: false,
  },
  muted: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

const Subscription = model("Subscription", SubscriptionSchema);

export default Subscription;
