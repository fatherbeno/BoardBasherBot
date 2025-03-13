import { Channel } from "discord.js";

export class CGlobalProperties {
    constructor(botReplyChannelID?: string, replyOperationPrefix?: string,
                commandErrorMessage?: string, maxBotMessageLength?: string,
                botDMReplyMessage?: string) {
        if (botReplyChannelID) this.__botReplyChannelID = botReplyChannelID;
        if (replyOperationPrefix) this.replyOperationPrefix = replyOperationPrefix;
        if (commandErrorMessage) this.commandErrorMessage = commandErrorMessage;
        if (maxBotMessageLength) this.maxBotMessageLength = +maxBotMessageLength;
        if (botDMReplyMessage) this.botDMReplyMessage = botDMReplyMessage;
    }

    // Channel that the bot will send messages into. (This is set using the /setbotreplychannel command, not using the /setglobalproperty command)
    private __botReplyChannelID: string = "1274158081059590164";
    // Custom prefix for the reply operation.
    public replyOperationPrefix: string = "B!r";
    // Error message for if command doesn't have a command properties entry.
    public commandErrorMessage: string = "An issue has occurred with this command, please try again later.";
    // Max message length value when sending a message to or as the bot.
    public maxBotMessageLength: number = 1900;
    // Message to send to user when they DM the bot.
    public botDMReplyMessage: string = "Thank you for the message, the bot will respond to you soon.";

    /**
     * Channel that the bot will send messages into.
     *
     * @return An ID that can be used to fetch the channel from the client.
     */
    public get botReplyChannel(): string {
        return this.__botReplyChannelID;
    }

    /**
     *
     * @param channel
     */
    public set botReplyChannel(channel: Channel) {
        this.__botReplyChannelID = channel.id;
    }
}