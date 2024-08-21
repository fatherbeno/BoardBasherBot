import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { dbData } from '../google-sheet'
import { TUserRowData } from "../typing-helpers/types/TUserRowData";
import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { getStringValue, sendReply } from "./command-helper";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../typing-helpers/enums/ELoggerCategory";

const googleLogger = getLogger(ELoggerCategory.GoogleSheets);

export const data = new SlashCommandBuilder()
  .setName("verify")
  .setDescription("Returns a row of data :)")
  .addStringOption((option) => {
    return option
        .setName("name")
        .setDescription("The name of the person you want to search")
        .setRequired(true)
})

const updateData = async (interaction: CommandInteraction, filteredRow: GoogleSpreadsheetRow<TUserRowData>): Promise<boolean> => {
  try {
    googleLogger.debug("Attempting to set data in sheet.")
    filteredRow.set("verified", true);
    filteredRow.set("discordId", interaction.member?.user?.id);
    await filteredRow.save();
    googleLogger.debug("Successfully set data in sheet.")
  } catch (error) {
      googleLogger.error("Failed to set data in sheet.", error);
      return false;
  }
  
  return true;
}

export const execute = async (commandInput: ICommandInput) => {
  const data = await dbData()
  const rows = await data.getRows<TUserRowData>()
  
  const name = getStringValue(commandInput, "name");
  const filteredRows = rows.filter((row) => {
    return row.get('name') === name;
  })
  
  if (filteredRows.length !== 1) {
    return sendReply(commandInput, "That user was not found, please try again");
  }
  
  const reply = await updateData(commandInput.interaction, filteredRows[0]) ?
    "You have successfully been verified!" :
    "You have not successfully been verified";
  return sendReply(commandInput, reply);
};