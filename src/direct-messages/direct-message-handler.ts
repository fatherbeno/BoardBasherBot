import config from "../config";
import { ChannelType, Client, Message, TextChannel } from "discord.js";

const getChannel = async (client: Client, channelId: string): Promise<TextChannel | null> => {
    
    // attempt to get the channel from channel id
    const channel = await client?.channels.fetch(channelId);
    
    // check if we got the channel that correlates to the correct channel type
    if (!channel || channel.type !== ChannelType.GuildText) {
        return null;
    }
    
    // return the channel 
    return channel;
}

const replyToDMInChannel = async (dm: Message<boolean>, channelId: string) => {
    
    if (dm.channel.type !== ChannelType.DM) {
        return;
    }
    
    const channel = await getChannel(dm.client, channelId);
    if (!channel) {
        return;
    }
    
    let replyMessage: string = `@${dm.author.displayName} said to me: ${dm.content}`;
    await channel.send(replyMessage);
}

export const handleDM = async (dm: Message<boolean>) => {
    await replyToDMInChannel(dm, config.DIRECT_MESSAGE_CHANNEL);
}