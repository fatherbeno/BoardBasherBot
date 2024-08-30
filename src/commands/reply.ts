import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { SlashCommandBuilder } from "discord.js";
import { getStringValue, sendReply, getTextChannel, logCommandError } from "./.command-helper";

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
    try {
        // get text channel
        const channel = await getTextChannel(commandInput);

        // get command user
        const { user } = commandInput.interaction;

        // get string value from command
        const message = getStringValue(commandInput, "message");

        // send message to channel
        await channel.send(`Hello ${user}! ${message}.`);

        // send reply to command
        return sendReply(commandInput, "I successfully replied!");
    } catch (error) {
        // log caught error
        await logCommandError(commandInput, error);
    }
};