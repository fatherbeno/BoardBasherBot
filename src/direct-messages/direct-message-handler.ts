import config from "../config";
import { ChannelType, Client, Guild, GuildMember, Message, TextChannel } from "discord.js";

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

const getGuild = async (client: Client): Promise<Guild | null> => {
    
    // attempt to get the guild from the guild id
    const guild = await client?.guilds.fetch(config.GUILD_ID);
    
    // check if we got the guild
    if (!guild) {
        return null
    }
    
    return guild;
}

const getMemberFromGuild = async (guild: Guild, memberId: string): Promise<GuildMember | null> => {
    
    // attempt to get the member from the guild
    const member = await guild?.members.fetch(memberId)
    
    // check if we got the member
    if (!member) {
        return null;
    }
    
    return member;
}

const replyToDMInChannel = async (dm: Message, channelId: string) => {
    const channel = await getChannel(dm.client, channelId);
    if (!channel) {
        return;
    }
    
    let replyMessage: string = `${dm.author} said to me: \n ${dm.content}`;
    await channel.send(replyMessage);
}

const replyToDMInDM = async (dm: Message) => {
    await dm.author.send("thanks for your message nerd, check the server chat to see your message being sent to everyone :P");
}

export const handleDM = async (dm: Message<boolean>) => {
    if (dm.author.id === config.APP_ID) {
        return;
    }
    
    if (dm.channel.type === ChannelType.DM) {
        await replyToDMInChannel(dm, config.DIRECT_MESSAGE_CHANNEL);
        await replyToDMInDM(dm);
    }
}