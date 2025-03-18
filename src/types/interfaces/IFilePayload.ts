import { TextChannel, User } from "discord.js";

/**
 * Payload to send to recipient to send a file.
 * 
 * @param recipient user / channel to send the file to.
 * @param fileName name of file you want to send, leave empty to send last created file.
 * @param message include optional message if you want to send a message along with the file.
 */
export interface IFilePayload {
    recipient: TextChannel | User;
    fileName?: string;
    message?: string;
}