import { ChannelType, Message } from "discord.js";
import { getChannel, isAuthorBot, sendMessageToChannel, sendMessageToDM, validateMessageLength } from "./.message-helper";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../typing-helpers/enums/ELoggerCategory";

const logger = getLogger(ELoggerCategory.DirectMessage);

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
    
    try {
        if (dm.channel.type === ChannelType.DM) {
            logger.info("Bot received a Direct Message (DM).");
            
            await replyToDMInChannel(dm);
            await replyToDMInDM(dm);
            
            logger.info("Bot successfully handled the DM.");
        }
    } catch (error) {
        logger.error("Failed to handle DM interaction.", error);
    }
}