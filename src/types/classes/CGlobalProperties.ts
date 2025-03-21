import { Channel } from "discord.js";

/**
 * Class used to translate json global properties data into easily usable data in code.
 * @author Benjamin Gulliver (fatherbeno)
 */
export class CGlobalProperties {
    constructor(replyOperationPrefix?: string, commandErrorMessage?: string,
                maxBotMessageLength?: string, botDMReplyMessage?: string, botDMFailMessage?: string,

                botReplyChannelID?: string, botVerificationChannelID?: string,
                botWelcomeChannelID?: string, botVerifyLogsID?: string, botErrorLogsID?: string) {

        if (replyOperationPrefix) this.ReplyOperationPrefix = replyOperationPrefix;
        if (commandErrorMessage) this.CommandErrorMessage = commandErrorMessage;
        if (maxBotMessageLength) this.MaxBotMessageLength = maxBotMessageLength;
        if (botDMReplyMessage) this.BotDMReplyMessage = botDMReplyMessage;
        if (botDMFailMessage) this.BotDMFailMessage = botDMFailMessage;

        if (botReplyChannelID) this.BotReplyChannel = botReplyChannelID;
        if (botVerificationChannelID) this.BotVerificationChannel = botVerificationChannelID;
        if (botWelcomeChannelID) this.BotWelcomeChannel = botWelcomeChannelID;
        if (botVerifyLogsID) this.BotVerifyLogsChannel = botVerifyLogsID;
        if (botErrorLogsID) this.BotErrorLogsChannel = botErrorLogsID;
    }

    /* -------------------- BOT INTEGRATION STUFF -------------------- */

    /**
     * The below values are set using the /setglobalproperties command.
     */

    /**
     * Custom prefix for the reply operation.
     * @private
     * @privateRemarks Provided text is default prefix if no reply operation prefix property has been set.
     */
    private _replyOperationPrefix: string = "B!r";

    /**
     * Custom prefix for the reply operation.
     * @return String that contains the reply operation prefix.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public get ReplyOperationPrefix(): string { return this._replyOperationPrefix; }

    /**
     * Custom prefix for the reply operation.
     * @param input String that sets the new reply operation prefix.
     * @author Benjamin Gulliver (fatherbeno)
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
     * @author Benjamin Gulliver (fatherbeno)
     */
    public get CommandErrorMessage(): string { return this._commandErrorMessage; }

    /**
     * Error message for if command doesn't have a command properties' entry.
     * @param input Global properties' new command error message.
     * @author Benjamin Gulliver (fatherbeno)
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
     * @author Benjamin Gulliver (fatherbeno)
     */
    public get MaxBotMessageLength(): number { return this._maxBotMessageLength; }

    /**
     * Max message length value when sending a message to or as the bot.
     * @param input Global properties' new max bot message length.
     * Validates that member input is actually a number, will throw an error if a string in inputted.
     * @author Benjamin Gulliver (fatherbeno)
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
     * @author Benjamin Gulliver (fatherbeno)
     */
    public get BotDMReplyMessage(): string { return this._botDMReplyMessage; }

    /**
     * Message to send to member when they DM the bot.
     * @param input Global properties' new bot DM reply message.
     * @author Benjamin Gulliver (fatherbeno)
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
     * @author Benjamin Gulliver (fatherbeno)
     */
    public get BotDMFailMessage(): string { return this._botDMFailMessage; }

    /**
     * Message to send to member when the bot fails to receive the member's DM for some reason.
     * @param input Global properties' new bot DM reply message.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public set BotDMFailMessage(input: string) { this._botDMFailMessage = input; }

    /* -------------------- BOT SPECIAL CHANNELS STUFF -------------------- */

    /**
     * The below values are set using the /setbotchannels command.
     */

    /**
     * Channel that the bot will send received messages into.
     * @private
     * @privateRemarks If no bot reply channel ID property has been set then the bot will fail to receive the message.
     */
    private _botReplyChannelID: string = "";

    /**
     * Channel that the bot will send received messages into.
     * @return An ID that can be used to fetch the channel from the client.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public get BotReplyChannel(): string { return this._botReplyChannelID; }

    /**
     * Channel that the bot will send received messages into.
     * @param channel Member input channel that then the ID is saved.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public set BotReplyChannel(channel: Channel | string) {
        if (typeof channel === "string") {
            this._botReplyChannelID = channel;
        } else {
            this._botReplyChannelID = channel.id;
        }
    }

    /**
     * Channel that the bot will delete all messages sent into.
     * @private
     * @privateRemarks If no channel ID property has been set then the bot will fail.
     */
    private _botVerificationChannelID: string = "";

    /**
     * Channel that the bot will delete all messages sent into.
     * @return Global properties' set bot verification channel.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public get BotVerificationChannel(): string { return this._botVerificationChannelID; }

    /**
     * Channel that the bot will delete all messages sent into.
     * @param channel Member input channel that then the ID is saved.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public set BotVerificationChannel(channel: Channel | string) {
        if (typeof channel === "string") {
            this._botVerificationChannelID = channel;
        } else {
            this._botVerificationChannelID = channel.id;
        }
    }

    /**
     * Channel that the bot send a welcome message for each member that successfully verifies.
     * @private
     * @privateRemarks If no channel ID property has been set then the bot will fail.
     */
    private _botWelcomeChannelID: string = "";

    /**
     * Channel that the bot send a welcome message for each member that successfully verifies.
     * @return Global properties' set bot verification channel.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public get BotWelcomeChannel(): string { return this._botWelcomeChannelID; }

    /**
     * Channel that the bot send a welcome message for each member that successfully verifies.
     * @param channel Member input channel that then the ID is saved.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public set BotWelcomeChannel(channel: Channel | string) {
        if (typeof channel === "string") {
            this._botWelcomeChannelID = channel;
        } else {
            this._botWelcomeChannelID = channel.id;
        }
    }

    /**
     * Channel that the bot send a log message for each member that successfully verifies.
     * @private
     * @privateRemarks If no channel ID property has been set then the bot will fail.
     */
    private _botVerifyLogsChannelID: string = "";

    /**
     * Channel that the bot send a log message for each member that successfully verifies.
     * @return Global properties' set bot verification channel.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public get BotVerifyLogsChannel(): string { return this._botVerifyLogsChannelID; }

    /**
     * Channel that the bot send a log message for each member that successfully verifies.
     * @param channel Member input channel that then the ID is saved.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public set BotVerifyLogsChannel(channel: Channel | string) {
        if (typeof channel === "string") {
            this._botVerifyLogsChannelID = channel;
        } else {
            this._botVerifyLogsChannelID = channel.id;
        }
    }

    /**
     * Channel that the bot send a log message for when a command fails to execute.
     * @private
     * @privateRemarks If no channel ID property has been set then the bot will fail.
     */
    private _botErrorLogsID: string = "";

    /**
     * Channel that the bot send a log message for when a command fails to execute.
     * @return Global properties' set bot verification channel.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public get BotErrorLogsChannel(): string { return this._botErrorLogsID; }

    /**
     * Channel that the bot send a log message for when a command fails to execute.
     * @param channel Member input channel that then the ID is saved.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public set BotErrorLogsChannel(channel: Channel | string) {
        if (typeof channel === "string") {
            this._botErrorLogsID = channel;
        } else {
            this._botErrorLogsID = channel.id;
        }
    }
}