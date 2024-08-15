import config from "./config";
import { Client } from "discord.js";
import { commands } from "./commands/commands";
import { deployCommands } from "./deploy-commands";

export const client = new Client({ intents: [
    "Guilds", "GuildModeration", "GuildEmojisAndStickers", "GuildMessages", "GuildMembers",
    "DirectMessages", "GuildMessageTyping", "GuildScheduledEvents", "MessageContent"
]});

client.once("ready", () => {
    console.log("Time for some Board Bashing :)");
});

client.on("guildCreate", async () => {
    await deployCommands();
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
      return;
    }
    
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
      await commands[commandName as keyof typeof commands].execute({interaction: interaction, client: client});
    }
});

client.login(config.BOT_TOKEN);