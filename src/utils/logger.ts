import { type SceneSessionData } from "@bot/helpers";
import { type Scenes, TelegramError } from "telegraf";
import util from "util";
import winston, { format } from "winston";

function prepareMessage(
  ctx: Scenes.SceneContext<SceneSessionData>,
  msg: any,
  ...data: any[]
): string {
  if (msg instanceof Error || msg instanceof TelegramError) {
    msg = ": " + msg.message + "/n" + msg.stack;
    if (msg.stack) {
      msg = msg + "/n" + msg.stack;
    }
    return `: ${msg}`;
  } else {
    const formattedMessage = data.length > 0 ? util.format(msg, ...data) : msg;

    if (ctx?.from) {
      return `[${ctx.from.id}/${ctx.from.username}]: ${formattedMessage}`;
    }

    return `: ${formattedMessage}`;
  }
}

const { combine, timestamp, printf } = format;
const logFormat = printf((info) => {
  return `[${info.timestamp}] [${info.level}]${info.message}`;
});

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === "production" ? "error" : "debug",
    }),
    new winston.transports.File({ filename: "debug.log", level: "debug" }),
  ],
  format: combine(timestamp(), format.splat(), format.simple(), logFormat),
});

if (process.env.NODE_ENV !== "production") {
  logger.debug(": Logging initialized at debug level");
}

const loggerWithCtx = {
  debugWithCtx: (
    ctx: Scenes.SceneContext<SceneSessionData>,
    msg: string,
    ...data: any[]
  ) => logger.debug(prepareMessage(ctx, msg, ...data)),
  errorWithCtx: (
    ctx: Scenes.SceneContext<SceneSessionData>,
    msg: any,
    ...data: any[]
  ) => logger.error(prepareMessage(ctx, msg, ...data)),
  debug: (msg: string) => {
    logger.debug(`: ${msg}`);
  },
  error: (msg: string, error?: any) => {
    if (error instanceof TelegramError) {
      msg = `: Telegram Error, Code "${error.code}", ${msg}\n${error.message}`;
      if (error.stack) {
        msg = msg + "\n" + error.stack;
      }
    } else if (error instanceof Error) {
      msg = `: NodeJS Error, ${msg}\n${error.message}`;
      if (error.stack) {
        msg = msg + "\n" + error.stack;
      }
    } else {
      msg = ": Unexpected error in Logger";
    }
    logger.error(msg);
  },
};

export default loggerWithCtx;
