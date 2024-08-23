import config from "../config";
import { Channel, ChannelType, Client, Guild, Message, TextChannel, User } from "discord.js";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../typing-helpers/enums/ELoggerCategory";

const logger = getLogger(ELoggerCategory.Message);

/**
 * Validates the length of an incoming message and checks if it is too long.
 *
 * @param message the incoming message.
 */
export const validateMessageLength = (message: Message): boolean => {
    const maxMessageLength = 1900; // need to set up global vars that can be changed
    const returnVal = message.content.length <= maxMessageLength;
    
    if (!returnVal) {
        logger.error(`Incoming message was too long, was longer than ${maxMessageLength} characters.`);
    }
    
    return returnVal;
}

/**
 * Attempts to fetch the DIRECT MESSAGE CHANNEL from the client.
 *
 * @param client the input client.
 */
export const getChannel = async (client: Client): Promise<TextChannel> => {
    if (!client?.channels) {
        throw new Error("Could not get channels from client.");
    }
    
    const channel = await client.channels.fetch(config.DIRECT_MESSAGE_CHANNEL);
    if (!channel || channel.type !== ChannelType.GuildText) {
        throw new Error("Could not fetch channel from client, or fetched channel was not a text channel.");
    }
    
    logger.debug("Successfully fetched text channel.");
    return channel;
}

/**
 * Attempts to fetch the specific guild listed in the config from the client.
 *
 * @param client the input client.
 */
export const getGuild = async (client: Client): Promise<Guild> => {
    if (!client?.guilds) {
        throw new Error("Could not get guilds from client.");
    }
    
    const guild = await client.guilds.fetch(config.GUILD_ID);
    if (!guild) {
        throw new Error("Failed to fetch guild from client.");
    }
    
    logger.debug("Successfully fetched guild.");
    return guild;
}

/**
 * Attempts to return the message that the input message replied to.
 *
 * @param message message that was replying to another message.
 */
export const getRepliedMessage = async (message: Message): Promise<Message> => {
    if (!message?.channel) {
        throw new Error("Could not get channel from message.");
    }
    
    if (message.channel.type !== ChannelType.GuildText) {
        throw new Error("Message channel was not a text channel.");
    }
    
    if (!message?.reference) {
        throw new Error("Could not get reference from message.");
    }

    if (!message.reference?.messageId) {
        throw new Error("Could not get messageId from reference.");
    }

    if (!message?.client) {
        throw new Error("Could not get client from message.");
    }

    const messageId = message.reference.messageId;
    const repliedMessage = await message.channel.messages.fetch(messageId);
    if (!repliedMessage) {
        throw new Error("Failed to fetch message from channel");
    }

    logger.debug("Successfully got replied to message.")
    return repliedMessage;
}

/**
 * Attempts to get the first mentioned user from a message.
 *
 * @param message in message to search for mentioned user.
 */
export const getMentionedUser = (message: Message): User => {
    if (!message?.mentions) {
        throw new Error("Could not get mentions from message.");
    }
    
    const mentionedUsers = message.mentions?.users;
    if (!mentionedUsers) {
        throw new Error("Could not get users from mentions.");
    }
    
    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser) {
        throw new Error("Could not get first user from mentions.");
    }
    
    logger.debug("Successfully got mentioned user.")
    return mentionedUser;
}

/**
 * Checks if input user is the client.
 *
 * @param author input user to check.
 */
export const isAuthorBot = (author: User): boolean => {
    return author.id === config.APP_ID;
}

/**
 * Checks if input channel is the designated bot reply text channel.
 *
 * @param channel input channel to check.
 */
export const isChannelDirectMessageChannel = (channel: Channel): boolean => {
    return channel.id === config.DIRECT_MESSAGE_CHANNEL;
}

/**
 * Sends a message to a channel.
 *
 * @param channel channel to send message to.
 * @param message message to send to channel.
 */
export const sendMessageToChannel = async (channel: TextChannel, message: string) => {
    await channel.send(message)
}

/**
 * Sends a direct message to a user.
 *
 * @param user user to send direct message to.
 * @param message message to direct message to user.
 */
export const sendMessageToDM = async (user: User, message: string) => {
    await user.send(message);
}