import dotenv from "dotenv";

dotenv.config();

export const { BOT_TOKEN = "", DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } = process.env;
