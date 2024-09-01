import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { SlashCommandBuilder } from "discord.js";
import { logCommandError, sendReply } from "./.command-helper";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

export const execute = async (commandInput: ICommandInput) => {
  try {
    // send reply to command
    return await sendReply(commandInput);
  } catch (error) {
    // log caught error
    await logCommandError(commandInput, error);
  }
};