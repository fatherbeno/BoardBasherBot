export class CCommandProperties {
    constructor(replyMessage: string, errorMessage: string, ephemeral: boolean = false, roles?: string[]) {
        this.replyMessage = replyMessage;
        this.errorMessage = errorMessage;
        this.ephemeral = ephemeral;
        this.roles = roles;
    }
    
    replyMessage: string;
    errorMessage: string;
    ephemeral: boolean;
    roles?: string[];
}