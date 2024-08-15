import { ICommandInput } from "../interfaces/ICommandInput";
import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("reply")
  .setDescription("Replies your specific message yippie!")
  .addStringOption((option) => {
      return option
          .setName("message")
          .setDescription("This is the message it will say back to you :)")
          .setRequired(true);
  });

export const execute = async (commandInput: ICommandInput) => {
    return commandInput.interaction.reply("Pong!");
};