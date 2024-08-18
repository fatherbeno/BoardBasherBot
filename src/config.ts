import dotenv from "dotenv";

dotenv.config();

const { APP_ID, BOT_TOKEN, PUBLIC_KEY, GUILD_ID, DIRECT_MESSAGE_CHANNEL } = process.env;

if (!APP_ID || !BOT_TOKEN || !PUBLIC_KEY || !GUILD_ID || !DIRECT_MESSAGE_CHANNEL) {
  throw new Error("Missing environment variables");
}

const config: Record<string, string> = {
  APP_ID,
  BOT_TOKEN,
  PUBLIC_KEY,
  GUILD_ID,
  DIRECT_MESSAGE_CHANNEL,
};

export default config;