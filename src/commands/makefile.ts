import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { SlashCommandBuilder} from "discord.js";
import { validateTextChannel } from "./command-helper";
import { promises } from "fs";

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
  const interaction = commandInput.interaction;
  const channel = await validateTextChannel(commandInput);
  if (!channel) {
    return;
  }
  
  const filePath = "./src/generated-files/message.txt";
  
  // @ts-ignore
  await promises.writeFile(filePath, interaction.options.getString("message"));
  await channel.send({files: [filePath]});
  return commandInput.interaction.reply("payload sent!");
};