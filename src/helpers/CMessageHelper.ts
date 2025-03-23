import config from "../config";
import {
    Channel,
    ChannelType,
    GuildTextBasedChannel,
    Message,
    TextChannel,
    User
} from "discord.js";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";
import { GlobalProperties } from "./CGlobalPropertiesHelper";

/**
 * Helper class to assist with anything to do with channel messages. Is constructed with a reference to the initial message.
 * @author Benjamin Gulliver (fatherbeno)
 */
export class CMessageHelper {

    /* -------------------- CLASS STUFF -------------------- */

    constructor(message: Message) {
        this._message = message;
    }

    /**
     * Received message when class was created.
     * @private
     */
    private readonly _message;

    /**
     * Received message when class was created.
     */
    public get message(): Message { return this._message; }

    /* -------------------- LOGGING STUFF -------------------- */

    private logger = getLogger(ELoggerCategory.Message);

    /* -------------------- DISCORD SPECIFIC STUFF -------------------- */

    /**
     * Validates the length of an incoming message and checks if it is too long.
     * @return True if incoming message is not too long, false if it is.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public isMessageLengthValid(): boolean {
        const maxMessageLength = GlobalProperties.getProperties().MaxBotMessageLength;
        const returnVal = this.message.content.length <= maxMessageLength;

        if (!returnVal) {
            this.logger.error(`Incoming message was too long, was longer than ${maxMessageLength} characters.`);
        }

        return returnVal;
    }

    /**
     * Attempts to fetch the bot reply channel from the client.
     * @return Successfully fetched bot reply chanel.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async getDMChannel(): Promise<TextChannel> {
        const client = this.message.client;

        if (!client?.channels) {
            throw new Error("Could not get channels from client.");
        }

        const channel = await client.channels.fetch(GlobalProperties.getProperties().BotReplyChannel);
        if (!channel || channel.type !== ChannelType.GuildText) {
            throw new Error("Could not fetch channel from client, or fetched channel was not a text channel.");
        }

        this.logger.debug("Successfully fetched text channel.");
        return channel;
    }

    /**
     * Attempts to return the message that the input message replied to.
     * @return Replied to message.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async getRepliedMessage(): Promise<Message> {
        if (!this.message?.channel) {
            throw new Error("Could not get channel from message.");
        }

        if (this.message.channel.type !== ChannelType.GuildText) {
            throw new Error("Message channel was not a text channel.");
        }

        if (!this.message?.reference) {
            throw new Error("Could not get reference from message.");
        }

        if (!this.message.reference?.messageId) {
            throw new Error("Could not get messageId from reference.");
        }

        if (!this.message?.client) {
            throw new Error("Could not get client from message.");
        }

        const messageId = this.message.reference.messageId;
        const repliedMessage = await this.message.channel.messages.fetch(messageId);
        if (!repliedMessage) {
            throw new Error("Failed to fetch message from channel");
        }

        this.logger.debug("Successfully got replied to message.")
        return repliedMessage;
    }

    /**
     * Attempts to get the first mentioned user from a message.
     * @param inMessage Message to search for mentioned user (defaults to initial message).
     * @return Mentioned user in message.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public getMentionedUser(inMessage?: Message): User {
        const msgToGetUser = inMessage ? inMessage : this.message

        if (!msgToGetUser?.mentions) {
            throw new Error("Could not get mentions from message.");
        }

        const mentionedUsers = msgToGetUser.mentions?.users;
        if (!mentionedUsers) {
            throw new Error("Could not get users from mentions.");
        }

        const mentionedUser = msgToGetUser.mentions.users.first();
        if (!mentionedUser) {
            throw new Error("Could not get first user from mentions.");
        }

        this.logger.debug("Successfully got mentioned user.")
        return mentionedUser;
    }

    /**
     * Checks if input user is the bot.
     * @param author User to test if they are the bot.
     * @return Whether the inputted user is the bot.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public isAuthorBot(author?: User): boolean {
        const authorToTest = author ? author : this.message.author
        return authorToTest.id === config.APP_ID;
    }

    /**
     * Checks to see if the channel is a specific channel by id.
     * @param channelID ID to test (usually parsing in a global property).
     * @param inChannel Channel to test (defaults to initial message's channel).
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private checkChannel(channelID: string, inChannel?: Channel): boolean {
        const channel = inChannel ? inChannel : this.message.channel;
        return channel.id === channelID;
    }

    /**
     * Checks if channel is the designated bot reply text channel.
     * @param inChannel Channel to test whether it is the bot reply channel.
     * @return True or false depending on if the channel is the bot reply channel.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public isChannelDirectMessageChannel(inChannel?: Channel): boolean {
        return this.checkChannel(GlobalProperties.getProperties().BotReplyChannel, inChannel);
    }

    /**
     * Checks if channel is the designated verify text channel.
     * @param inChannel Channel to test whether it is the verify channel.
     * @return True or false depending on if the channel is the verify channel.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public isChannelVerifyChannel(inChannel?: Channel): boolean {
        return this.checkChannel(GlobalProperties.getProperties().BotVerificationChannel, inChannel);
    }

    /**
     * Sends a message to a channel.
     * @param channel Channel to send message to.
     * @param inMessage Message to send to channel (defaults to initial message).
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async sendMessageToChannel(channel: TextChannel, inMessage?: string) {
        const msgToSend = inMessage ? inMessage : this.message.content;
        await channel.send(msgToSend)
    }

    /**
     * Sends a direct message to a user.
     * @param message Message to dm user.
     * @param user User to send direct message to (defaults to initial message's author).
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async sendMessageToDM(message: string, user?: User) {
        const userToDM = user ? user : this.message.author;
        await userToDM.send(message);
    }

    /**
     * Attempts to delete a specific message from a specific channel.
     * @param inMessage Message to delete (defaults to initial message).
     * @param inChannel Channel to delete message from (defaults to initial message's channel).
     */
    public async deleteMessageFromChannel(inMessage?: Message, inChannel?: GuildTextBasedChannel) {
        const message = inMessage ? inMessage : this.message;
        const channel: GuildTextBasedChannel = inChannel ? inChannel : <GuildTextBasedChannel>this.message.channel;
        await channel.messages.delete(message)
    }
}