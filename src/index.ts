import config from "./config";
import { Client } from "discord.js";
import { commands } from "./commands/commands";
import { deployCommands } from "./deploy-commands";

export const client = new Client({ intents: [
    "Guilds", "GuildModeration", "GuildEmojisAndStickers", "GuildMessages",
    "DirectMessages", "GuildMessageTyping", "GuildScheduledEvents"
]});

client.once("ready", () => {
    console.log("Time for some Board Bashing :)");
});

client.on("guildCreate", async (guild) => {
    await deployCommands({guildId: guild.id});
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
      return;
    }
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
      await commands[commandName as keyof typeof commands].execute(interaction);
    }
});

const startBot = async () => {
    try {
        await client.login(config.DISCORD_TOKEN);
        await deployCommands({guildId: config.GUILD_ID});
    } catch (e) {
        console.log(e);
    }
}

startBot()