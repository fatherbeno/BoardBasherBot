import dotenv from "dotenv";

dotenv.config();

const {
  APP_ID,
  BOT_TOKEN,
  PUBLIC_KEY,
  GUILD_ID,
  DIRECT_MESSAGE_CHANNEL,
  GOOGLE_SHEET_ID,
} = process.env;

if (
  !APP_ID ||
  !BOT_TOKEN ||
  !PUBLIC_KEY ||
  !GUILD_ID ||
  !DIRECT_MESSAGE_CHANNEL ||
  !GOOGLE_SHEET_ID
  )
{
  throw new Error("Missing environment variables");
}

const config: Record<string, string> = {
  APP_ID,
  BOT_TOKEN,
  PUBLIC_KEY,
  GUILD_ID,
  DIRECT_MESSAGE_CHANNEL,
  GOOGLE_SHEET_ID,
};

export default config;