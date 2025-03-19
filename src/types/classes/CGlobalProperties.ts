import { Channel } from "discord.js";

/**
 * Class used to translate json global properties data into easily usable data in code.
 * @author Benjamin Gulliver (fatherbeno)
 */
export class CGlobalProperties {
    constructor(botReplyChannelID?: string, replyOperationPrefix?: string,
                commandErrorMessage?: string, maxBotMessageLength?: string,
                botDMReplyMessage?: string, botDMFailMessage?: string) {
        if (botReplyChannelID) this.BotReplyChannel = botReplyChannelID;
        if (replyOperationPrefix) this.ReplyOperationPrefix = replyOperationPrefix;
        if (commandErrorMessage) this.CommandErrorMessage = commandErrorMessage;
        if (maxBotMessageLength) this.MaxBotMessageLength = maxBotMessageLength;
        if (botDMReplyMessage) this.BotDMReplyMessage = botDMReplyMessage;
        if (botDMFailMessage) this.BotDMFailMessage = botDMFailMessage;
    }

    /**
     * Channel that the bot will send messages into.
     * @private
     * @privateRemarks This is set using the /setbotreplychannel command, not using the /setglobalproperty command.
     * @privateRemarks Provided id is default channel id if no bot reply channel id property has been set.
     */
    private _botReplyChannelID: string = "1274158081059590164";

    /**
     * Channel that the bot will send messages into.
     * @return An id that can be used to fetch the channel from the client.
     */
    public get BotReplyChannel(): string { return this._botReplyChannelID; }

    /**
     * Channel that the bot will send messages into.
     * @param channel member input channel that then the id is saved.
     * @privateRemarks This is set using the /setbotreplychannel command, not using the /setglobalproperty command.
     */
    public set BotReplyChannel(channel: Channel | string) {
        if (typeof channel === "string") {
            this._botReplyChannelID = channel;
        } else {
            this._botReplyChannelID = channel.id;
        }
    }

    /**
     * Custom prefix for the reply operation.
     * @private
     * @privateRemarks Provided text is default prefix if no reply operation prefix property has been set.
     */
    private _replyOperationPrefix: string = "B!r";

    /**
     * Custom prefix for the reply operation.
     * @return String that contains the reply operation prefix.
     */
    public get ReplyOperationPrefix(): string { return this._replyOperationPrefix; }

    /**
     * Custom prefix for the reply operation.
     * @param input String that sets the new reply operation prefix.
     */
    public set ReplyOperationPrefix(input: string) { this._replyOperationPrefix = input; }

    /**
     * Error message for if command doesn't have a command properties' entry.
     * @private
     * @privateRemarks Provided text is default message if no error message property has been set.
     */
    public _commandErrorMessage: string = "An issue has occurred with this command, please try again later.";

    /**
     * Error message for if command doesn't have a command properties' entry.
     * @return Global properties' set command error message.
     */
    public get CommandErrorMessage(): string { return this._commandErrorMessage; }

    /**
     * Error message for if command doesn't have a command properties' entry.
     * @param input Global properties' new command error message.
     */
    public set CommandErrorMessage(input: string) { this._commandErrorMessage = input; }

    /**
     * Max message length value when sending a message to or as the bot.
     * @private
     * @privateRemarks Provided number is default limit if no max bot message length property has been set.
     */
    private _maxBotMessageLength: number = 1900;

    /**
     * Max message length value when sending a message to or as the bot.
     * @return Global properties' set max bot message length.
     */
    public get MaxBotMessageLength(): number { return this._maxBotMessageLength; }

    /**
     * Max message length value when sending a message to or as the bot.
     * @param input Global properties' new max bot message length.
     * Validates that member input is actually a number, will throw an error if a string in inputted.
     */
    public set MaxBotMessageLength(input: string) {
        const inNumber = +input;

        if (!inNumber) throw new Error("Attempted to set maxBotMessageLength to something that wasn't a number.");

        this._maxBotMessageLength = inNumber;
    }

    /**
     * Message to send to member when they DM the bot.
     * @private
     * @privateRemarks Provided text is default message if no bot DM reply message property has been set.
     */
    private _botDMReplyMessage: string = "Thank you for the message, the bot will respond to you soon.";

    /**
     * Message to send to member when they DM the bot.
     * @return Global properties' set bot DM reply message.
     */
    public get BotDMReplyMessage(): string { return this._botDMReplyMessage; }

    /**
     * Message to send to member when they DM the bot.
     * @param input Global properties' new bot DM reply message.
     */
    public set BotDMReplyMessage(input: string) { this._botDMReplyMessage = input; }

    /**
     * Message to send to member when the bot fails to receive the member's DM for some reason.
     * @private
     * @privateRemarks Provided text is default message if no bot DM reply message property has been set.
     */
    private _botDMFailMessage: string = "Oopsies! It looks like something went wrong and I am not receiving messages at the moment. Please try again later.";

    /**
     * Message to send to member when the bot fails to receive the member's DM for some reason.
     * @return Global properties' set bot DM reply message.
     */
    public get BotDMFailMessage(): string { return this._botDMFailMessage; }

    /**
     * Message to send to member when the bot fails to receive the member's DM for some reason.
     * @param input Global properties' new bot DM reply message.
     */
    public set BotDMFailMessage(input: string) { this._botDMFailMessage = input; }
}