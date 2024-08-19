import { ChannelType, Message } from "discord.js";
import { getChannel, isAuthorBot, sendMessageToChannel, sendMessageToDM, validateMessageLength } from "./message-helper";

const replyToDMInChannel = async (dm: Message) => {
    const channel = await getChannel(dm.client);
    if (!channel) {
        return;
    }
    
    let replyMessage: string = `${dm.author} said to me: \n ${dm.content}`;
    await sendMessageToChannel(channel, replyMessage);
}

const replyToDMInDM = async (dm: Message) => {
    const message = "thanks for your message nerd, check the server chat to see your message being sent to everyone :P";
    await sendMessageToDM(dm.author, message);
}

export const handleDM = async (dm: Message) => {
    if (isAuthorBot(dm.author) || !validateMessageLength(dm)) {
        return;
    }
    
    if (dm.channel.type === ChannelType.DM) {
        await replyToDMInChannel(dm);
        await replyToDMInDM(dm);
    }
}