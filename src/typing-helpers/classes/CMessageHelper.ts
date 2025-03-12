import config from "../../config";
import { ChannelType, Message, TextChannel, User } from "discord.js";
import { getLogger } from "../../logging-config";
import { ELoggerCategory } from "../../typing-helpers/enums/ELoggerCategory";

export class CMessageHelper {
    /* -------------------- CLASS STUFF -------------------- */

    constructor(message: Message) {
        this.__message = message;
    }

    private readonly __message;

    public get message(): Message { return this.__message }

    /* -------------------- LOGGING STUFF -------------------- */

    private logger = getLogger(ELoggerCategory.Message);

    /* -------------------- DISCORD SPECIFIC STUFF -------------------- */

    /**
     * Validates the length of an incoming message and checks if it is too long.
     */
    public isMessageLengthValid = (): boolean => {
        const maxMessageLength = 1900; // GLOBAL_VAR
        const returnVal = this.message.content.length <= maxMessageLength;

        if (!returnVal) {
            this.logger.error(`Incoming message was too long, was longer than ${maxMessageLength} characters.`);
        }

        return returnVal;
    }

    /**
     * Attempts to fetch the DIRECT MESSAGE CHANNEL from the client.
     */
    public getDMChannel = async (): Promise<TextChannel> => {
        const client = this.message.client;

        if (!client?.channels) {
            throw new Error("Could not get channels from client.");
        }

        const channel = await client.channels.fetch(config.DIRECT_MESSAGE_CHANNEL /*GLOBAL_VAR*/);
        if (!channel || channel.type !== ChannelType.GuildText) {
            throw new Error("Could not fetch channel from client, or fetched channel was not a text channel.");
        }

        this.logger.debug("Successfully fetched text channel.");
        return channel;
    }

    /**
     * Attempts to return the message that the input message replied to.
     *
     * @param message message that was replying to another message.
     */
    public getRepliedMessage = async (): Promise<Message> => {
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
     *
     * @param inMessage in message to search for mentioned user. (defaults to initial message)
     */
    public getMentionedUser = (inMessage?: Message): User => {
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
     * Checks if input user is the client.
     */
    public isAuthorBot = (author?: User): boolean => {
        const authorToTest = author ? author : this.message.author
        return authorToTest.id === config.APP_ID;
    }

    /**
     * Checks if input channel is the designated bot reply text channel.
     */
    public isChannelDirectMessageChannel = (): boolean => {
        return this.message.channel.id === config.DIRECT_MESSAGE_CHANNEL; //GLOBAL_VAR
    }

    /**
     * Sends a message to a channel.
     *
     * @param channel channel to send message to.
     * @param inMessage message to send to channel. (defaults to initial message)
     */
    public sendMessageToChannel = async (channel: TextChannel, inMessage?: string) => {
        const msgToSend = inMessage ? inMessage : this.message.content;
        await channel.send(msgToSend)
    }

    /**
     * Sends a direct message to a user.
     *
     * @param user user to send direct message to. (defaults to user who messaged the bot)
     * @param message message to direct message to user.
     */
    public sendMessageToDM = async (message: string, user?: User) => {
        const userToDM = user ? user : this.message.author;
        await userToDM.send(message);
    }
}