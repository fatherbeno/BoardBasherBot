import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { SlashCommandBuilder } from "discord.js";
import { getStringValue, sendReply, validateTextChannel } from "./command-helper";

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
    
    // check if command was in normal text chat
    const channel = await validateTextChannel(commandInput);
    if (!channel) {
        return;
    }
    
    // now we can send message
    const { user } = commandInput.interaction;
    const message = getStringValue(commandInput, "message");
    await channel.send(`Hello ${user}! ${message}.`);
    return sendReply(commandInput, "I successfully replied!");
};