import { ICommandInput } from "../interfaces/ICommandInput";
import { SlashCommandBuilder, ChannelType } from "discord.js";
import {validateTextChannel} from "./command-helper";

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
    const interaction = commandInput.interaction;
    
    // check if command was in normal text chat
    const channel = await validateTextChannel(commandInput);
    if (!channel) {
        return;
    }
    
    // now we can send message
    const { user } = interaction;
    // @ts-ignore
    const message = interaction.options.getString("message");
    await channel.send(`Hello ${user}! ${message}.`);
    return interaction.reply("I successfully replied!")
};