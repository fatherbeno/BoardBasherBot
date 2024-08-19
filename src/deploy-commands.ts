import config from "./config";
import { REST, Routes } from "discord.js";
import { commands } from "./commands/.commands";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);

export async function deployCommands() {
  try {
    console.log("Started refreshing application (/) commands.");
    
    await rest.put(
      Routes.applicationGuildCommands(config.APP_ID, config.GUILD_ID),
      {
        body: commandsData,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

deployCommands();