/**
 * Class used to translate json command properties data into easily usable data in code.
 */
export class CCommandProperties {
    constructor(replyMessage?: string, errorMessage?: string, extraMessage?: string, ephemeral?: boolean) {
        if (replyMessage) this.ReplyMessage = replyMessage;
        if (errorMessage) this.ErrorMessage = errorMessage;
        if (extraMessage) this.ExtraMessage = extraMessage;
        if (ephemeral) this.Ephemeral = ephemeral;
    }

    /**
     * Message user sees after the command is successfully executed.
     * @private
     * @privateRemarks Provided text is default message if no reply message property has been set.
     */
    private _replyMessage: string = "Command was completed successfully.";

    /**
     * Message user sees after the command is successfully executed.
     * @return Command's set reply message.
     */
    public get ReplyMessage(): string { return this._replyMessage; }

    /**
     * Message user sees after the command is successfully executed.
     * @param input Command's new reply message.
     */
    public set ReplyMessage(input: string) { this._replyMessage = input; }

    /**
     * Message user sees after the command is unsuccessfully executed.
     * @private
     * @privateRemarks Provided text is default message if no error message property has been set.
     */
    private _errorMessage: string = "Command has failed to complete, please try again later.";

    /**
     * Message user sees after the command is unsuccessfully executed.
     * @return Command's set error message.
     */
    public get ErrorMessage(): string { return this._errorMessage; }

    /**
     * Message user sees after the command is unsuccessfully executed.
     * @param input Command's new error message.
     */
    public set ErrorMessage(input: string) { this._errorMessage = input; }

    /**
     * Message user sees if an additional message is sent when the command is successfully executed.
     * @private
     * @privateRemarks Default is left empty due to only certain commands requiring an extra message.
     */
    private _extraMessage: string = "";

    /**
     * Message user sees if an additional message is sent when the command is successfully executed.
     * @return Command's set extra message.
     */
    public get ExtraMessage(): string { return this._extraMessage; }

    /**
     * Message user sees if an additional message is sent when the command is successfully executed.
     * @param input Command's new extra message.
     */
    public set ExtraMessage(input: string) { this._extraMessage = input; }

    /**
     * Determines whether any messages sent are visible to only the user of the command.
     * @private
     * @privateRemarks Default is set to true as it is better practice to not pollute any channels.
     */
    private _ephemeral: boolean = true;

    /**
     * Determines whether any messages sent are visible to only the user of the command.
     * @return Whether command is ephemeral or not.
     */
    public get Ephemeral(): boolean { return this._ephemeral; }

    /**
     * Determines whether any messages sent are visible to only the user of the command.
     * @param input Set whether command is ephemeral or not.
     */
    public set Ephemeral(input: boolean) { this._ephemeral = input; }
}