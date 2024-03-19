import { type Scenes } from "telegraf";
import util from "util";
import winston, { format } from "winston";

function prepareMessage(
  ctx: Scenes.SceneContext,
  msg: string,
  ...data: any[]
): string {
  const formattedMessage = data.length > 0 ? util.format(msg, ...data) : msg;

  if (ctx?.from) {
    return `[${ctx.from.id}/${ctx.from.username}]: ${formattedMessage}`;
  }

  return `: ${formattedMessage}`;
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
  logger.debug("Logging initialized at debug level");
}

const loggerWithCtx = {
  debugWithCtx: (ctx: Scenes.SceneContext, msg: string, ...data: any[]) =>
    logger.debug(prepareMessage(ctx, msg, ...data)),
  errorWithCtx: (ctx: Scenes.SceneContext, msg: string, ...data: any[]) =>
    logger.error(prepareMessage(ctx, msg, ...data)),
  debug: logger.debug,
  error: logger.error,
};

export default loggerWithCtx;
