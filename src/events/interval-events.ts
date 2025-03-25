import { CategoryChannel, Client, TextChannel } from "discord.js";
import { GlobalProperties } from "../helpers/.helpers";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";

const logger = getLogger(ELoggerCategory.Event);

// standard interval timers
const oneSecond = 1000;
const oneMinute = oneSecond*60;
const oneHour = oneMinute*60;
const oneDay = oneHour*24;

// custom interval timers
/**
 * Timer for channel countdown. Triggers at least twice an hour.
 */
const twentyNineMinutes = oneMinute*29;

/**
 * Starts all the intervals that are necessary for any interval functionality.
 * @param client Inputted client when bot started.
 * @author Benjamin Gulliver (fatherbeno)
 */
export const launchIntervalEvents = (client: Client) => {
    logger.info("Launching interval events.");

    setInterval(async function() {
        await channelCountdownEvent(client);
    }, twentyNineMinutes);

    logger.info("Interval events successfully launched.");
}

/**
 * Stored reference to the current countdown message.
 */
let countdownMessage: string;
/**
 * Stored reference to the current countdown channel.
 */
let countdownChannel: TextChannel | CategoryChannel;

/**
 * Counts down from the current date to a specified date.
 * - Displays a set countdown message then the number of days until the countdown is complete.
 * - When countdown is complete, displays countdown completion message.
 * @param client Inputted client when bot started.
 * @author Benjamin Gulliver (fatherbeno)
 */
const channelCountdownEvent = async (client: Client) => {
    try {
        // date functionality to calculate the difference (in days) between two dates
        const currentDate = new Date()
        const countdownDate = new Date(GlobalProperties.getProperties().CountdownDate);
        const daysBetweenDates = Math.floor((countdownDate.getTime() - currentDate.getTime()) / oneDay);

        // setting which message to display on whether the countdown is complete
        const message = daysBetweenDates > 0 ?
            `${GlobalProperties.getProperties().CountdownMessage} ${daysBetweenDates}` :
            GlobalProperties.getProperties().CountdownCompletionMessage

        // if the countdown channel has changed or the channel name is not correct then we update the countdownChannel reference
        if (!countdownChannel || countdownChannel.id !== GlobalProperties.getProperties().CountdownChannel || countdownChannel.name !== message) {
            const fetchedChannel = await client.channels.fetch(GlobalProperties.getProperties().CountdownChannel);
            if (fetchedChannel) countdownChannel = (fetchedChannel as TextChannel | CategoryChannel);
        }

        // if the countdown message has changed, we set the channel name to the new channel message
        if (!countdownMessage || message !== countdownMessage || countdownChannel.name !== countdownMessage) {
            countdownMessage = message;
            countdownChannel.setName(countdownMessage).then();
            logger.debug(`Successfully updated the countdown with the message ${countdownMessage}.`);
        }
    } catch (error) {
        logger.error("Failed to update the countdown.", error)
    }
}