import { Subscription } from '@interfaces/player.interface';
import subscriptionModel from '@models/subscription.model';

const subscription = subscriptionModel;

export const createSubscribeOnServer = async (userId?: number, server?: string) => {
  try {
    if (userId && server) {
      const checkSub = await subscription.findOne({ user_id: userId, server });
      if (checkSub) {
        return 'alreadyExist';
      };
      const sub = new subscription({
        user_id: userId,
        server: server,
        createdAt: new Date()
      });

      return await sub.save();
    } else {
      return 'invalidData';
    };
  } catch (error) {
    console.log('Error in "createSubscribeOnServer"', error);
    throw error;
  }
};

export const getUserServersSubscriptions = async (userId?: number) => {
  try {
    if (userId) {
      const subs = await subscription.find({ user_id: userId, guild: null });
      return subs;
    };
  } catch (error) {
    console.log('Error in "getUserServersSubscriptions"', error);
    throw error;
  };
};

export const getUserSubscriptions = async (userId?: number) => {
  try {
    if (userId) {
      const subs = await subscription.find({ user_id: userId })
      return subs
    };
  } catch (error) {
    console.log('Error in "getUserSubscriptions"', error);
    throw error;
  };
};

export const getSubscriptionById = async (subId?: string) => {
  try {
    return await subscription.findOne({ _id: subId });
  } catch (error) {
    console.log('Error in "getSubscriptionById"', error);
    throw error;
  };
};

export const deleteSubscription = async (subId: string) => {
  try {
    return await subscription.deleteOne({ _id: subId });
  } catch (error) {
    console.log('Error in "deleteSubscription"', error);
    throw error;
  };
};
