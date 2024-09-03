import { Client, CommandInteraction } from "discord.js";

export interface ICommandInput {
    interaction: CommandInteraction;
    client: Client;
}