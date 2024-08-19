import config from "./config";
import { Client, Partials } from "discord.js";
import { commands } from "./commands/.commands";
import { deployCommands } from "./deploy-commands";
import { messageHandlers } from "./messages/.message-handlers";

export const client = new Client({ intents: [
    "Guilds", "GuildModeration", "GuildEmojisAndStickers", "GuildMessages", "GuildMembers",
    "DirectMessages", "GuildMessageTyping", "GuildScheduledEvents", "MessageContent"
], partials: [
    Partials.Channel, Partials.Message
]});

client.once("ready", () => {
    console.log("Time for some Board Bashing :)");
});

client.on("guildCreate", async () => {
    await deployCommands();
});

client.on("messageCreate",  async (message) => {
    if (!message) {
        return;
    }
    
    await messageHandlers.dmHandler.handleDM(message)
    await messageHandlers.replyHandler.handleReply(message);
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