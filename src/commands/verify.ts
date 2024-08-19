import { ICommandInput } from "../interfaces/ICommandInput";
import { SlashCommandBuilder } from "discord.js";
import { sheet } from '../google-sheet'

export const data = new SlashCommandBuilder()
  .setName("verify")
  .setDescription("Returns a row of data :)");

export const execute = async (commandInput: ICommandInput) => {
  await sheet.loadInfo()
  return commandInput.interaction.reply(sheet.title);
};