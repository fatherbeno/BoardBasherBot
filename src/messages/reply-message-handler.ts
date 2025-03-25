import { Message, User } from "discord.js";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";
import { CMessageHelper } from "../helpers/CMessageHelper";
import { GlobalProperties } from "../helpers/.helpers";

const logger = getLogger(ELoggerCategory.Message);

/**
 * Confirms if operation is a reply operation by testing to see if the reply operation prefix is at the start of the message.
 * @param reply Message to test if the reply operation prefix is present.
 * @author Benjamin Gulliver (fatherbeno)
 */
const confirmReplyOperation = (reply: Message): boolean => {
    const prefixIndex = reply.content.indexOf(GlobalProperties.getProperties().ReplyOperationPrefix);
    return prefixIndex === 0;
}

/**
 * Once the reply operation is confirmed, the operation is validated to make sure it is following correct procedure.
 * Reply operation is validated if:
 * - Operation was started in designated reply channel.
 * - Operation was replying to another message.
 * - Operation was replying to the bot.
 * - Operation can find a mentioned user in the replied to message.
 * @param msgHelper Message helper class generated when message was received.
 * @author Benjamin Gulliver (fatherbeno)
 */
const validateReplyOperation = async (msgHelper: CMessageHelper): Promise<null | User> => {
    // check operation was sent in correct channel (channel should be set in global var)
    if (!msgHelper.isChannelDirectMessageChannel()) {
        throw new Error("Reply operation was attempted in incorrect channel.");
    }

    // get replied to message
    const repliedMessage = await msgHelper.getRepliedMessage();
    if (!repliedMessage) {
        throw new Error("Reply operation was not started as a reply.")
    }

    // check if operation was replying to bot message
    if (!msgHelper.isAuthorBot(repliedMessage.author)) {
        throw new Error("Reply operation did not reply to the bot.");
    }

    // finally get the first mentioned user
    return msgHelper.getMentionedUser(repliedMessage);
}

/**
 * If the reply operation is validated, the message of the operation is sent to the user who sent the initial message to the bot.
 * @param user Member to send reply operation message to.
 * @param msgHelper Message helper class generated when message was received.
 * @author Benjamin Gulliver (fatherbeno)
 */
const replyToBotDM = async (user: User, msgHelper: CMessageHelper) => {
    const { content } = msgHelper.message;
    if (!msgHelper.isMessageLengthValid()) {
        return;
    }
    const message = content.substring(GlobalProperties.getProperties().ReplyOperationPrefix.length);
    await msgHelper.sendMessageToDM(message, user);
}

/**
 * Handles any reply operations started by a member.
 * @param msgHelper Message helper class generated when message was received.
 * @author Benjamin Gulliver (fatherbeno)
 */
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

/**
 * Handles any intended reply operations sent to any channels the bot has access to.
 * @param msgHelper Message helper class generated when message was received.
 * @author Benjamin Gulliver (fatherbeno)
 */
export const handleReply = async (msgHelper: CMessageHelper) => {
    if (confirmReplyOperation(msgHelper.message)) {
       await handleReplyOperation(msgHelper);
    }
}