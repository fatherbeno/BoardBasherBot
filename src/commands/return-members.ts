import { ICommandInput } from "../interfaces/ICommandInput";
import { ChannelType, GuildMember, SlashCommandBuilder } from "discord.js";
import { validateTextChannel, validateGuildMembers} from "./command-helper";

export const data = new SlashCommandBuilder()
  .setName("getmembers")
  .setDescription("Returns all members on the server!");

export const execute = async (commandInput: ICommandInput) => {
    const members = await validateGuildMembers(commandInput);
    if (!members) {
        return;
    }
    
    const channel = await validateTextChannel(commandInput);
    if (!channel) {
        return;
    }
    
    let message: string = '';
    members.forEach((member) => {
        message += member.displayName
    })
    
    await channel.send(message);
    return commandInput.interaction.reply("Members!!");
};