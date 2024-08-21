import config from "./config";
import { REST, Routes } from "discord.js";
import { commands } from "./commands/.commands";
import { getLogger } from "./logging-config";
import { ELoggerCategory } from "./typing-helpers/enums/ELoggerCategory";

const logger = getLogger(ELoggerCategory.Core);

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);

export async function deployCommands() {
  try {
    logger.debug("Started refreshing application (/) commands.");
    
    await rest.put(
      Routes.applicationGuildCommands(config.APP_ID, config.GUILD_ID),
      {
        body: commandsData,
      }
    );

    logger.debug("Successfully reloaded application (/) commands.");
  } catch (error) {
    logger.error("Failed to deploy commands.", error);
  }
}

deployCommands();