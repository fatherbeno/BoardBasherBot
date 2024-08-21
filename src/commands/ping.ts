import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

export const execute = async (commandInput: ICommandInput) => {
    return commandInput.interaction.reply("Pong!");
};