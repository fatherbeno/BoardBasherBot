import {
    Channel,
    ChannelType,
    Client,
    Collection,
    CommandInteraction,
    Guild,
    GuildMember,
    Role,
    TextChannel
} from "discord.js";
import { ICommandInput } from "../types/interfaces/ICommandInput";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";
import { CommandProperties, LogErrorMessage } from "./.helpers";

/**
 * Helper class that generates whenever a command is executed. Includes many functions that minimise command complications.
 * @author Benjamin Gulliver (fatherbeno)
 */
export class CCommandHelper {

    /* -------------------- CLASS STUFF -------------------- */

    constructor(commandInput: ICommandInput) {
        this._interaction = commandInput.interaction;
        this._client = commandInput.client;
    }

    /**
     * Received command when class was created.
     * @private
     */
    private readonly _interaction: CommandInteraction;

    /**
     * Reference to the client (aka the bot).
     * @private
     */
    private readonly _client: Client;

    /**
     * Received command when class was created.
     */
    public get interaction(): CommandInteraction { return this._interaction; }

    /**
     * Reference to the client (aka the bot).
     */
    public get client(): Client { return this._client; }

    /**
     * Reference to the name of the command that was used.
     */
    public get commandName(): string { return this.interaction.commandName }

    /**
     * To be used when you want to execute a command. All cross command functionality is handled while unique command functionality is created within the callback.
     * @param func Callback function that is executed within this function.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async executeCommand(func?: () => Promise<void>) {
        try {
            // code that executes per command
            if (func) { await func(); }

            // send reply to command
            return await this.sendReply();
        } catch (error) {
            // log caught error
            await this.logCommandError(error);
        }
    }

    /* -------------------- LOGGING STUFF -------------------- */

    private readonly logger = getLogger(ELoggerCategory.Command);

    /**
     * Logs a command error in console and discord, then sends an error message to the member.
     * @param error Error message to be displayed in the logs.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private async logCommandError(error: any) {
        const errorMessage = `Command **/${this.interaction.commandName}** has failed to execute for member ${this.getCommandUserMember()}.`;
        this.logger.error(errorMessage, error);

        await LogErrorMessage.sendErrorMessage(errorMessage, error);

        if (!this.interaction.replied) {
            await this.sendReply(true);
        }
    }

    /* -------------------- DISCORD SPECIFIC STUFF -------------------- */

    /**
     * Validates and attempts to fetch all users from the guild (the discord server).
     * @return A collection of guild members (server members).
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async getGuildMembers(memberID?: string): Promise<Collection<string, GuildMember> | GuildMember> {
        this.logger.debug("Attempting to fetch guild members.");
        let output: Collection<string, GuildMember> | GuildMember;

        if (!this.interaction?.guild) {
            throw new Error("Could not get guild from interaction.");
        }

        if (!this.interaction.guild?.members) {
            throw new Error("Could not get members from guild.");
        }

        if (!memberID) {
            output = await this.interaction.guild.members?.fetch();
            if (!output) {
                throw new Error("Failed to fetch members from guild.");
            }
        } else {
            output = await this.interaction.guild.members?.fetch(memberID);
            if (!output) {
                throw new Error("Failed to fetch member from guild based on the ID.");
            }
        }

        this.logger.debug("Successfully fetched all guild members.");
        return output
    }

    /**
     * Validates and attempts to fetch a channel from the guild using a channel ID.
     * @return Text chat that the command was used in. Will only check for normal text chats.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async getTextChannel(inChannelId: string = ""): Promise<TextChannel> {
        const channelId = inChannelId ? inChannelId : this.interaction.channelId;
        if (!channelId) {
            throw new Error("Could not get channelId from interaction.");
        }

        const channel = await this.client?.channels.fetch(channelId);
        if (!channel || channel.type !== ChannelType.GuildText) {
            throw new Error("Could not fetch channel from client, or fetched channel was not a text channel.");
        }

        this.logger.debug("Successfully fetched text channel.");
        return channel
    }

    /**
     * Attempts to send a reply message to the member who used a command.
     * @param error Optional param to log an error if true.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async sendReply(error: boolean = false) {
        if (this.interaction.replied) { return }

        const cmdProperties = CommandProperties.getProperties(this.commandName);

        const replyMessage = error ? cmdProperties.ErrorMessage : cmdProperties.ReplyMessage;

        const response = this.interaction.deferred ?
            await this.interaction.editReply(replyMessage) :
            await this.interaction.reply({ content: replyMessage, ephemeral: cmdProperties.Ephemeral });

        if (response && !error) this.logger.info(`Successfully replied to '${this.interaction.user.username}' who used command /${this.interaction.commandName}.`);
        if (response && error) this.logger.error(`Failed to execute command /${this.interaction.commandName} for user '${this.interaction.user.username}' with error message '${replyMessage}'.`);

        return response;
    }

    /**
     * Validates and attempts to fetch a role from the guild using a role ID.
     * @param roleId ID to use to try and find corresponding guild role.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async getRole(roleId: string): Promise<Role> {
        this.logger.debug("Attempting to fetch a role through an ID.");

        if (!this.interaction?.guild) {
            throw new Error("Could not get guild from interaction.");
        }

        if (!this.interaction.guild?.roles) {
            throw new Error("Could not get roles from guild.");
        }

        let role = await this.interaction.guild.roles.fetch(roleId);
        if (!role) {
            throw new Error("Failed to fetch role with provided ID.");
        }

        this.logger.debug("Successfully fetched role.");
        return role;
    }

    /**
     * Returns the member who used the command.
     * @return Guild member who used the command.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public getCommandUserMember(): GuildMember {
        return <GuildMember>this.interaction.member;
    }

    /**
     * Returns value of addStringOption on command depending on value name.
     * @param valueName Name used to find data of a value.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public getStringValue(valueName: string): string {
        // @ts-ignore
        return this.interaction.options.getString(valueName);
    }

    /**
     * Returns value of addRoleOption on command depending on value name.
     * @param valueName Name used to find data of a value.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public getRoleValue(valueName: string): Role {
        // @ts-ignore
        return this.interaction.options.getRole(valueName);
    }

    /**
     * Returns value of addChannelOption on command depending on value name.
     * @param valueName Name used to find data of a value.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public getChannelValue(valueName: string): Channel {
        // @ts-ignore
        return this.interaction.options.getChannel(valueName);
    }

    /**
     * If a command takes more then 3 seconds to execute, the reply needs to be deferred so it doesn't time out.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async deferReply() {
        await this.interaction.deferReply({ ephemeral: CommandProperties.getProperties(this.commandName).Ephemeral });
    }
}