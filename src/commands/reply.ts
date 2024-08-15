import { ICommandInput } from "../interfaces/ICommandInput";
import { SlashCommandBuilder, ChannelType } from "discord.js";

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
    const interaction = commandInput.interaction;
    const client = commandInput.client;
    
    // confirm we got channel id
    if (!interaction?.channelId) {
        return;
    }
    
    // check if command was in normal text chat
    const channel = await client?.channels.fetch(interaction.channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
        return;
    }
    
    // now we can send message
    const { user } = interaction;
    // @ts-ignore
    const message = interaction.options.getString("message");
    await channel.send(`Hello ${user}! ${message}. :thematrix:`);
    return interaction.reply("I successfully replied!")
};