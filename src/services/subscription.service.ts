import { type Subscription } from "@interfaces/player.interface";
import SubscriptionModel from "@models/subscription.model";

export const createSubscribeOnServer = async (
  userId?: number,
  server?: string,
): Promise<any> => {
  try {
    if (userId != null && server != null) {
      const checkSub = await SubscriptionModel.findOne({
        user_id: userId,
        server,
        guild: null,
      });
      if (checkSub != undefined) {
        return "alreadyExist";
      }
      const sub = new SubscriptionModel({
        user_id: userId,
        server,
        createdAt: new Date(),
      });

      return await sub.save();
    } else {
      return "invalidData";
    }
  } catch (error) {
    console.log('Error in "createSubscribeOnServer"', error);
    throw error;
  }
};

export const createSubscribeOnGuild = async (
  userId?: number,
  server?: string,
  guildName?: string,
): Promise<any> => {
  try {
    if (userId != null && server != null && guildName != null) {
      const checkSub = await SubscriptionModel.findOne({
        user_id: userId,
        server,
        guild: guildName,
      });
      if (checkSub != undefined) {
        return "alreadyExist";
      }
      const sub = new SubscriptionModel({
        user_id: userId,
        server,
        guild: guildName,
        createdAt: new Date(),
      });

      return await sub.save();
    } else {
      return "invalidData";
    }
  } catch (error) {
    console.log('Error in "createSubscribeOnGuild"', error);
    throw error;
  }
};

export const getUserServersSubscriptions = async (
  userId?: number,
): Promise<Subscription[] | undefined> => {
  try {
    if (userId != null) {
      const subs = await SubscriptionModel.find<Subscription>({
        user_id: userId,
        guild: null,
      });
      return subs;
    }
  } catch (error) {
    console.log('Error in "getUserServersSubscriptions"', error);
    throw error;
  }
};

export const getUserGuildSubscriptions = async (
  userId?: number,
): Promise<Subscription[] | undefined> => {
  try {
    if (userId != null) {
      const subs = await SubscriptionModel.find<Subscription>({
        user_id: userId,
        guild: { $ne: null },
      });
      return subs;
    }
  } catch (error) {
    console.log('Error in "getUserGuildSubscriptions"', error);
    throw error;
  }
};

export const getUserSubscriptions = async (
  userId?: number,
): Promise<Subscription[] | undefined> => {
  try {
    if (userId != null) {
      const subs = await SubscriptionModel.find<Subscription>({
        user_id: userId,
      });
      return subs;
    }
  } catch (error) {
    console.log('Error in "getUserSubscriptions"', error);
    throw error;
  }
};

export const getSubscriptionById = async (
  subscriptionId?: string,
): Promise<Subscription | null | undefined> => {
  try {
    return await SubscriptionModel.findOne({ _id: subscriptionId });
  } catch (error) {
    console.log('Error in "getSubscriptionById"', error);
    throw error;
  }
};

export const deleteSubscription = async (
  subscriptionId: string,
): Promise<any> => {
  try {
    return await SubscriptionModel.deleteOne({ _id: subscriptionId });
  } catch (error) {
    console.log('Error in "deleteSubscription"', error);
    throw error;
  }
};

export const muteSubscription = async (
  subscriptionId?: string,
): Promise<Subscription | null | undefined> => {
  try {
    if (subscriptionId != null) {
      const subs = await SubscriptionModel.findByIdAndUpdate<Subscription>(
        { _id: subscriptionId },
        { muted: true },
      );
      return subs;
    }
  } catch (error) {
    console.log('Error in "muteSubscription"', error);
    throw error;
  }
};

export const getServerSubscriptions = async (
  server: string,
): Promise<Subscription[] | null> => {
  try {
    return await SubscriptionModel.find({
      server,
      guild: null,
    });
  } catch (error) {
    console.log('Error in "getServerSubscriptions"', error);
    throw error;
  }
};

export const getServerGuildSubscriptions = async (
  server: string,
): Promise<Subscription[] | null> => {
  try {
    return await SubscriptionModel.find({
      server,
      guild: { $ne: null },
    });
  } catch (error) {
    console.log('Error in "getServerSubscriptions"', error);
    throw error;
  }
};
