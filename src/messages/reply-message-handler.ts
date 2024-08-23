import {Message, User} from "discord.js";
import {
    getMentionedUser,
    getRepliedMessage,
    isAuthorBot,
    isChannelDirectMessageChannel,
    sendMessageToDM,
    validateMessageLength
} from "./.message-helper";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../typing-helpers/enums/ELoggerCategory";

const logger = getLogger(ELoggerCategory.Message);

const commandPrefix = "B!r"; // also need to set to global var that can be changed
const confirmReplyOperation = (reply: Message): boolean => {
    const prefixIndex = reply.content.indexOf(commandPrefix);
    
    return prefixIndex === 0;
}

const validateReplyOperation = async (reply: Message): Promise<null | User> => {
    // check operation was sent in correct channel (channel should be set in global var)
    if (!isChannelDirectMessageChannel(reply.channel)) {
        throw new Error("Reply operation was attempted in incorrect channel.");
    }
    
    // get replied to message
    const repliedMessage = await getRepliedMessage(reply);
    
    // check if operation was replying to bot message
    if (!isAuthorBot(repliedMessage.author)) {
        throw new Error("Reply operation did not reply to the bot.");
    }

    // finally get the first mentioned user
    return getMentionedUser(repliedMessage);
}

const replyToBotDM = async (user: User, reply: Message) => {
    const content = reply.content;
    if (!validateMessageLength(reply)) {
        return;
    }
    const message = content.substring(commandPrefix.length);
    await sendMessageToDM(user, message);
}

const handleReplyOperation = async (reply: Message) => {
    try {
        logger.info(`User '${reply.author.username}' used the reply operation to reply to a Bot Direct Message (DM).`)
        
        const userToReplyTo = await validateReplyOperation(reply)
        if (userToReplyTo) {
            await replyToBotDM(userToReplyTo, reply);
        }
        
        logger.info(`Successfully sent the reply that user '${reply.author.username}' issued.`);
    } catch (error) {
        logger.error("Failed to complete reply operation.", error);
    }
}

export const handleReply = async (reply: Message) => {
    if (confirmReplyOperation(reply)) {
       await handleReplyOperation(reply);
    }
}