import { GlobalProperties } from "./CGlobalPropertiesHelper";
import {Channel, ChannelType, Client, TextChannel} from "discord.js";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";

/**
 * Helper class tasked with sending any error messages that occur, to the error logging chat in the guild.
 * @author Benjamin Gulliver (fatherbeno)
 */
class CLogErrorMessageHelper {

    private readonly logger = getLogger(ELoggerCategory.Core);

    /**
     * Reference to the client (aka the bot).
     * @private
     */
    private _client: Client | undefined;

    /**
     * To be used in index.ts once the client is ready.
     * @param client Input client to inject into system.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public set Client(client: Client) {
        this._client = client;
    }

    /**
     * Stored text channel to use so we do not have to fetch new one. Will fetch new one if global properties data changes.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    // @ts-ignore
    private _channel: TextChannel;

    /**
     * Validates and attempts to fetch the set error logs channel from the guild. If same channel has already been fetched, will not fetch it again.
     * @return Validated bot error logs channel.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private async getTextChannel(): Promise<TextChannel> {
        // check if loaded channel is equal to the one set in global perms
        // if it is, no need to fetch again. if it isn't, then we fetch the new channel.
        if (this._channel?.id === GlobalProperties.getProperties().BotErrorLogsChannel) { return this._channel; }

        // attempt to fetch channel data using global properties data
        const channel = await this._client?.channels.fetch(GlobalProperties.getProperties().BotErrorLogsChannel);
        if (!channel || channel.type !== ChannelType.GuildText) {
            throw new Error("Could not fetch channel from client, or fetched channel was not a text channel.");
        }

        // saved fetched data to use again
        this._channel = channel;

        return channel
    }

    /**
     * Will attempt to log an error to the bot error logs channel in the guild.
     * @param message Error message to display.
     * @param error The error itself (why we are sending an error log).
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async sendErrorMessage(message: string, error: any) {
        try {
            const errorLogChannel = await this.getTextChannel();
            await errorLogChannel.send({content: `${message}\n${error}`});
        } catch (error) {
            this.logger.error("Attempted to send error message to bot error logs chat but failed.", error);
        }
    }
}

/**
 * Copy of log error message helper and its data.
 * @author Benjamin Gulliver (fatherbeno)
 */
export const LogErrorMessage = new CLogErrorMessageHelper();