import config from "../config";
import { Channel, ChannelType, Client, Guild, GuildMember, Message, TextChannel, User } from "discord.js";


export const validateMessageLength = (message: Message): boolean => {
    return message.content.length <= 1900;
}

export const getChannel = async (client: Client): Promise<TextChannel | null> => {
    
    // attempt to get the channel from channel id
    const channel = await client?.channels.fetch(config.DIRECT_MESSAGE_CHANNEL);
    
    // check if we got the channel that correlates to the correct channel type
    if (!channel || channel.type !== ChannelType.GuildText) {
        return null;
    }
    
    // return the channel 
    return channel;
}

export const getGuild = async (client: Client): Promise<Guild | null> => {
    
    // attempt to get the guild from the guild id
    const guild = await client?.guilds.fetch(config.GUILD_ID);
    
    // check if we got the guild
    if (!guild) {
        return null
    }
    
    return guild;
}

export const getMemberFromGuild = async (guild: Guild, memberId: string): Promise<GuildMember | null> => {
    
    // attempt to get the member from the guild
    const member = await guild?.members.fetch(memberId)
    
    // check if we got the member
    if (!member) {
        return null;
    }
    
    return member;
}

export const getRepliedMessage = async (message: Message, channel: TextChannel): Promise<Message | null> => {
    
    if (!message?.reference) {
        return null;
    }
    
    if (!message.reference?.messageId) {
        return null;
    }
    
    const messageId = message.reference.messageId;
    if (!messageId) {
        return null;
    }
    
    if (!message?.client) {
        return null;
    }
    
    const repliedMessage = await channel.messages.fetch(messageId);
    if (!repliedMessage) {
        return null
    }
    
    return repliedMessage;
}

export const getMentionedUser = (message: Message): (User | null) => {
    
    if (!message?.mentions) {
        return null;
    }
    
    if (!message?.mentions?.users) {
        return null;
    }
    
    const mentionedUsers = message.mentions.users;
    if (!mentionedUsers) {
        return null;
    }
    
    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser) {
        return null;
    }
    
    return mentionedUser;
}

export const isAuthorBot = (author: User): boolean => {
    return author.id === config.APP_ID;
}

export const isChannelCorrectChannel = (channel: Channel): boolean => {
    return channel.id === config.DIRECT_MESSAGE_CHANNEL;
}

export const sendMessageToChannel = async (channel: TextChannel, message: string) => {
    channel.send(message)
}

export const sendMessageToDM = async (user: User, message: string) => {
    user.send(message);
}