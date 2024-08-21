import { ICommandInput } from "../interfaces/ICommandInput";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { dbData } from '../google-sheet'
import { TUserRowData } from "../types/TUserRowData";
import { GoogleSpreadsheetRow } from "google-spreadsheet";

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
    filteredRow.set("verified", true);
    filteredRow.set("discordId", interaction.member?.user?.id);
    await filteredRow.save();
  } catch (e) {
      console.log(e);
      return false;
  }
  return true;
}

export const execute = async (commandInput: ICommandInput) => {
  const data = await dbData()
  const rows = await data.getRows<TUserRowData>()
  // @ts-ignore
  const name = commandInput.interaction.options.getString("name")
  const filteredRows = rows.filter((row) => {
    return row.get('name') === name;
  })
  
  if (filteredRows.length !== 1) {
    return commandInput.interaction.reply("That user was not found, please try again");
  }
  
  const reply = await updateData(commandInput.interaction, filteredRows[0]) ?
    "You have successfully been verified!" :
    "You have not successfully been verified";
  return commandInput.interaction.reply(reply);
};