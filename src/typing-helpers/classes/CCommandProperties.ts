export class CCommandProperties {
    constructor(replyMessage: string, errorMessage: string, extraMessage: string = "", ephemeral: boolean = false) {
        this.replyMessage = replyMessage;
        this.errorMessage = errorMessage;
        this.extraMessage = extraMessage;
        this.ephemeral = ephemeral;
    }
    
    replyMessage: string;
    errorMessage: string;
    extraMessage: string;
    ephemeral: boolean;
}