import { ChannelType, Collection, GuildMember, TextChannel } from "discord.js";
import { ICommandInput } from "../interfaces/ICommandInput";

/**
 * Attempts to return a collection of guildmembers (server members).
 * You still need to make sure the promise doesnt resolve to null after using this function.
 * 
 * @param commandInput the command inputs
 * @return Promise<Collection<string, GuildMember> | null>
 */
export const validateGuildMembers = async (commandInput: ICommandInput): Promise<Collection<string, GuildMember> | null> => {
    
    // check for guild
    if(!commandInput.interaction?.guild) {
        return null;
    }
    
    // check for members
    if (!commandInput.interaction.guild?.members) {
        return null;
    }
    
    // return all members
    return commandInput.interaction.guild?.members?.fetch();
}

/**
 * Attempts to return the text chat that the command was used in. Will only check for normal text chats.
 * You still need to make sure the promise doesnt resolve to null after using this function.
 *
 * @param commandInput the command inputs
 * @return Promise<TextChannel | null>
 */
export const validateTextChannel = async (commandInput: ICommandInput): Promise<TextChannel | null> => {
    
    // check if we got channel id
    if (!commandInput.interaction?.channelId) {
        return null;
    }
    
    // attempt to get the channel from channel id
    const channel = await commandInput.client?.channels.fetch(commandInput.interaction.channelId);
    
    // check if we got the channel that correlates to the correct channel type
    if (!channel || channel.type !== ChannelType.GuildText) {
        return null;
    }
    
    // return the channel 
    return channel;
}