import { TextChannel, User } from "discord.js";

/**
 * Payload to send a file to a recipient.
 * @author Benjamin Gulliver (fatherbeno)
 */
export interface IFilePayload {
    recipient: TextChannel | User;
    filePath: string;
    message?: string;
}