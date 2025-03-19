import { Client, CommandInteraction } from "discord.js";

/**
 * Input data for whenever a member uses a command.
 * @author Benjamin Gulliver (fatherbeno)
 */
export interface ICommandInput {
    interaction: CommandInteraction;
    client: Client;
}