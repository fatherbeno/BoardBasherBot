import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";
import { CMessageHelper } from "../helpers/CMessageHelper";

const logger = getLogger(ELoggerCategory.Message)

/**
 * Handles any messages sent to any channels the bot has access to.
 * @param msgHelper Message helper class generated when message was received.
 * @author Benjamin Gulliver (fatherbeno)
 */
export const handleMessage = async (msgHelper: CMessageHelper) => {
    try {
        if (msgHelper.isChannelVerifyChannel()) {
            logger.info("Message has been sent to the verify channel, attempting to delete it.");

            await msgHelper.deleteMessageFromChannel();

            logger.info("Successfully deleted the message.");
            return;
        }
    } catch (error) {
        logger.error("Failed to handle a general message", error);
    }
}