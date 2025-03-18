import { ChannelType } from "discord.js";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";
import { CMessageHelper } from "../helpers/CMessageHelper";
import { GlobalProperties } from "../helpers/CGlobalPropertiesHelper";

const logger = getLogger(ELoggerCategory.DirectMessage);

const replyToDMInChannel = async (msgHelper: CMessageHelper) => {
    const channel = await msgHelper.getDMChannel();
    if (!channel) {
        return;
    }

    const replyMessage: string = `${msgHelper.message.author} said to me: \n ${msgHelper.message.content}`;
    await msgHelper.sendMessageToChannel(channel, replyMessage);
}

const replyToDMInDM = async (msgHelper: CMessageHelper) => {
    const message = GlobalProperties.getProperties().BotDMReplyMessage;
    await msgHelper.sendMessageToDM(message);
}

export const handleDM = async (msgHelper: CMessageHelper) => {
    if (msgHelper.isAuthorBot() || !msgHelper.isMessageLengthValid()) {
        return;
    }
    
    try {
        if (msgHelper.message.channel.type === ChannelType.DM) {
            logger.info(`Bot received a Direct Message (DM) from ${msgHelper.message.author.username}.`);
            
            await replyToDMInChannel(msgHelper);
            await replyToDMInDM(msgHelper);
            
            logger.info("Bot successfully handled the DM.");
        }
    } catch (error) {
        logger.error("Failed to handle DM interaction.", error);
    }
}