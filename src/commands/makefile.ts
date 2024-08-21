import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { SlashCommandBuilder} from "discord.js";
import { createFile, getStringValue, sendFile, sendReply, validateTextChannel } from "./command-helper";

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
  const channel = await validateTextChannel(commandInput);
  if (!channel) {
    return;
  }
  
  await createFile("message.txt", getStringValue(commandInput, "message"));
  await sendFile(channel);
  return sendReply(commandInput, "payload sent!");
};