import {Channel, Guild, TextChannel} from "discord.js";

export class CGlobalProperties {
    constructor(botReplyChannel?: Channel, replyOperationPrefix?: string, commandErrorMessage?: string) {
        this.botReplyChannel = botReplyChannel;
        if (replyOperationPrefix) this.replyOperationPrefix = replyOperationPrefix;
        if (commandErrorMessage) this.commandErrorMessage = commandErrorMessage;
    }

    // Channel that the bot will send messages into.
    public botReplyChannel;
    // Custom prefix for the reply operation.
    public replyOperationPrefix: string = "B!r";
    // Default error message for if command doesn't have a command properties entry.
    public commandErrorMessage: string = "An issue has occurred with this command, please try again later.";
}