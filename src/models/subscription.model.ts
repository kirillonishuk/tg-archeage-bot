import { Schema, model } from 'mongoose';

import { SERVER_NAME_CODES } from '@configs/archeage';

const SubscriptionSchema = new Schema({
  user_id: {
    type: Number,
    required: true
  },
  server: {
    type: String,
    enum: SERVER_NAME_CODES,
    required: true
  },
  guild: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    required: true
  }
});

const Subscription = model('Subscription', SubscriptionSchema);

export default Subscription;