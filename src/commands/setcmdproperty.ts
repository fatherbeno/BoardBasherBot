import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { SlashCommandBuilder } from "discord.js";
import {getStringValue, logCommandError, sendReply, setCommandProperties} from "./.command-helper";

export const data = new SlashCommandBuilder()
  .setName("setcmdproperty")
  .setDescription("Sets a command property!")
  .addStringOption((option) => {
    return option
      .setName("command")
      .setDescription("The command to be changed.")
      .setRequired(true)
      .addChoices(
        { name: "getmembers", value: "getmembers" },
        { name: "makefile", value: "makefile" },
        { name: "ping", value: "ping" },
        { name: "reply", value: "reply" },
        { name: "setcmdproperty", value: "setcmdproperty" },
        { name: "verify", value: "verify" },
      )
  })
  .addStringOption((option) => {
    return option
      .setName("property")
      .setDescription("The property to set.")
      .setRequired(true)
      .addChoices(
        { name: "reply message", value: "replyMessage" },
        { name: "error message", value: "errorMessage" },
        { name: "extra message", value: "extraMessage" },
        { name: "ephemeral", value: "ephemeral" },
      )
  })
  .addStringOption((option) => {
    return option
      .setName("value")
      .setDescription("What to set the property to.")
      .setRequired(true)
});

export const execute = async (commandInput: ICommandInput) => {
  try {
    setCommandProperties(getStringValue(commandInput, "command"), getStringValue(commandInput, "property"), getStringValue(commandInput, "value"))
    // send reply to command
    return await sendReply(commandInput);
  } catch (error) {
    // log caught error
    await logCommandError(commandInput, error);
  }
};