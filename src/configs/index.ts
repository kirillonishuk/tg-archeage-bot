import dotenv from "dotenv";

dotenv.config();

export const { BOT_TOKEN = "", DB_HOST, DB_PORT, DB_DATABASE } = process.env;
export const MAX_TELEGRAM_MESSAGE_LENGTH = 4096;
