import config from "./config";
import { Client, Partials } from "discord.js";
import { commands } from "./commands/.commands";
import { deployCommands } from "./deploy-commands";
import { messageHandlers } from "./messages/.message-handlers";
import { getLogger } from "./logging-config";
import { ELoggerCategory } from "./types/enums/ELoggerCategory";
import { CCommandHelper } from "./helpers/CCommandHelper";
import { CMessageHelper } from "./helpers/CMessageHelper";
import { LogErrorMessage } from "./helpers/CLogErrorMessageHelper";

const logger = getLogger(ELoggerCategory.Core);
const commandLogger = getLogger(ELoggerCategory.Command);

export const client = new Client({ intents: [
    "Guilds", "GuildModeration", "GuildEmojisAndStickers", "GuildMessages", "GuildMembers",
    "DirectMessages", "GuildMessageTyping", "GuildScheduledEvents", "MessageContent"
], partials: [
    Partials.Channel, Partials.Message
]});

client.once("ready", () => {
    LogErrorMessage.Client = client;
    logger.debug("Bot Online: Time for some epic bot functionality :)");
});

client.on("guildCreate", async () => {
    await deployCommands();
});

client.on("messageCreate",  async (message) => {
    if (!message) { return; }

    const messageHelper = new CMessageHelper(message);
    if (!messageHelper.isAuthorBot() && messageHelper.isMessageLengthValid()) {
        await messageHandlers.dmHandler.handleDM(messageHelper)
        await messageHandlers.replyHandler.handleReply(messageHelper);
        await messageHandlers.generalHandler.handleMessage(messageHelper);
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
      return;
    }
    
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
      commandLogger.info(`User '${interaction.user.username}' used command /${commandName}.`)
      await commands[commandName as keyof typeof commands].execute(new CCommandHelper({interaction: interaction, client: client}));
    }
});

client.login(config.BOT_TOKEN);