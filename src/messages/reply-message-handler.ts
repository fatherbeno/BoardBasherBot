import { Message, User } from "discord.js";
import { getChannel, getMentionedUser, getRepliedMessage, isAuthorBot, isChannelCorrectChannel, validateMessageLength } from "./message-helper";

const commandPrefix = "B!r";
const confirmReplyOperation = (reply: Message): boolean => {
    const prefixIndex = reply.content.indexOf(commandPrefix);
    
    return prefixIndex === 0;
}

const validateReplyOperation = async (reply: Message): Promise<null | User> => {
    const channel = await getChannel(reply.client);
    if (!channel) {
        return null;
    }
    
    if (!isChannelCorrectChannel(reply.channel)) {
        return null;
    }
    
    const repliedMessage = await getRepliedMessage(reply, channel);
    if (!repliedMessage) {
        return null;
    }
    
    if (!isAuthorBot(repliedMessage.author)) {
        return null;
    }
    
    if (!confirmReplyOperation(reply)) {
        return null;
    }
    
    const mentionedUser = getMentionedUser(repliedMessage);
    return mentionedUser ? mentionedUser : null;
}

const replyToBotDM = async (user: User, reply: Message) => {
    const content = reply.content;
    if (!validateMessageLength(reply)) {
        return;
    }
    const message = content.substring(commandPrefix.length);
    await user.send(message);
}

export const handleReply = async (reply: Message) => {
    const userToReplyTo = await validateReplyOperation(reply)
    if (userToReplyTo) {
        await replyToBotDM(userToReplyTo, reply);
    }
}