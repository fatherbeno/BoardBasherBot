import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { SlashCommandBuilder } from "discord.js";
import { deferReply, findRow, getStringValue, logCommandError, sendReply, updateSheet } from "./.command-helper";

export const data = new SlashCommandBuilder()
  .setName("verify")
  .setDescription("Returns a row of data :)")
  .addStringOption((option) => {
    return option
        .setName("name")
        .setDescription("The name of the person you want to search")
        .setRequired(true)
})

export const execute = async (commandInput: ICommandInput) => {
  try {
    // deferring reply as operation takes more than 3 seconds
    await deferReply(commandInput);
    
    // use name input to find a row with a unique, corresponding name
    const name = getStringValue(commandInput, "name");
    const filteredRow = await findRow((elt) => {
      return elt.get("name") === name;
    });
    
    // update filtered row on the sheet
    // changes reply message whether update is successful or not
    const reply = await updateSheet(filteredRow, () => {
          filteredRow.set("verified", true);
          filteredRow.set("discordId", commandInput.interaction.user.id);
        }) ? "You have successfully been verified!" : "You have not successfully been verified";
    
    // send reply
    return sendReply(commandInput, reply);
  } catch (error) {
    // log caught error
    await logCommandError(commandInput, error);
  }
};