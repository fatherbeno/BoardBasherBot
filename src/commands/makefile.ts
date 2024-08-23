import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { SlashCommandBuilder} from "discord.js";
import { createFile, getStringValue, sendFile, sendReply, getTextChannel, logCommandError } from "./.command-helper";
export const data = new SlashCommandBuilder()
  .setName("makefile")
  .setDescription("Generates a text file")
  .addStringOption((option) => {
    return option
        .setName("message")
        .setDescription("This will be the message in the file")
        .setRequired(true);
});

export const execute = async (commandInput: ICommandInput) => {
  try {
    // get channel command was used in
    const channel = await getTextChannel(commandInput);
    
    // generate, then send file to channel
    await createFile("message.txt", getStringValue(commandInput, "message"));
    await sendFile(channel);
    
    // send reply to command
    return sendReply(commandInput, "payload sent!");
  } catch (error) {
    // log caught error
    logCommandError(commandInput, error);
  }
};