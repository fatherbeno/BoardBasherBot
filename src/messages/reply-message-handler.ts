import { Message, User } from "discord.js";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../typing-helpers/enums/ELoggerCategory";
import { getGlobalProperties} from "../properties/global-properties-helper";
import { CMessageHelper } from "../typing-helpers/classes/CMessageHelper";

const logger = getLogger(ELoggerCategory.Message);
const confirmReplyOperation = (reply: Message): boolean => {
    const prefixIndex = reply.content.indexOf(getGlobalProperties().replyOperationPrefix);

    return prefixIndex === 0;
}

const validateReplyOperation = async (msgHelper: CMessageHelper): Promise<null | User> => {
    // check operation was sent in correct channel (channel should be set in global var)
    if (!msgHelper.isChannelDirectMessageChannel()) {
        throw new Error("Reply operation was attempted in incorrect channel.");
    }

    // get replied to message
    const repliedMessage = await msgHelper.getRepliedMessage();

    // check if operation was replying to bot message
    if (!msgHelper.isAuthorBot(repliedMessage.author)) {
        throw new Error("Reply operation did not reply to the bot.");
    }

    // finally get the first mentioned user
    return msgHelper.getMentionedUser(repliedMessage);
}

const replyToBotDM = async (user: User, msgHelper: CMessageHelper) => {
    const { content } = msgHelper.message;
    if (!msgHelper.isMessageLengthValid()) {
        return;
    }
    const message = content.substring(getGlobalProperties().replyOperationPrefix.length);
    await msgHelper.sendMessageToDM(message, user);
}

const handleReplyOperation = async (msgHelper: CMessageHelper) => {
    try {
        logger.info(`User '${msgHelper.message.author.username}' used the reply operation to reply to a Bot Direct Message (DM).`)

        const userToReplyTo = await validateReplyOperation(msgHelper)
        if (userToReplyTo) {
            await replyToBotDM(userToReplyTo, msgHelper);
        }

        logger.info(`Successfully sent the reply that user '${msgHelper.message.author.username}' issued.`);
    } catch (error) {
        logger.error("Failed to complete reply operation.", error);
    }
}

export const handleReply = async (msgHelper: CMessageHelper) => {
    if (confirmReplyOperation(msgHelper.message)) {
       await handleReplyOperation(msgHelper);
    }
}