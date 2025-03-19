import { Channel, ChannelType, Client, Collection, CommandInteraction, GuildMember, Role, TextChannel } from "discord.js";
import { ICommandInput } from "../types/interfaces/ICommandInput";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";
import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { IUpdateDataInput } from "../types/interfaces/IUpdateDataInput";
import { TRowData } from "../types/types/TRowData";
import { getSheet } from "../google-sheet";
import { FileSystem } from "./CFileSystemHelper";
import { EFileTypeCategory } from "../types/enums/EFileTypeCategory";
import { CommandProperties } from "./CCommandPropertiesHelper";

/**
 * Helper class generate whenever a command is executed. Includes many functions that minimise command complications.
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
    private readonly googleLogger = getLogger(ELoggerCategory.GoogleSheets);

    /**
     * Logs a command error and then sends an error message to the user.
     * @param error Error message to be displayed in the logs.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private async logCommandError(error: any) {
        this.logger.error(`Command ${this.interaction.commandName} has failed to execute.`, error);

        if (!this.interaction.replied) {
            await this.sendReply(true);
        }
    }

    /* -------------------- INTEGRATION STUFF -------------------- */

    /**
     * Loads verify roles from json file in runtime, file can be changed and changes will be reflected without rebuilding.
     * @return Array of roles read from the json file.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async getVerifyRoles(): Promise<Role[]> {
        const verifyRolesJson = await FileSystem.readFile(EFileTypeCategory.VerifyRoles);
        const verifyRoles = verifyRolesJson as string[]

        let roles: Role[] = []

        for (let roleId of verifyRoles) {
            roles.push(await this.getRole(roleId))
        }

        return roles;
    }

    /**
     * Sets verify roles to json file in runtime.
     * @param roles Array of roles to save to json file.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async setVerifyRoles(roles: Role[]) {
        let roleIds: string[] = [];

        roles.forEach((role) => {
            roleIds.push(role.id);
        })

        await FileSystem.writeFile(EFileTypeCategory.VerifyRoles, roleIds);
    }

    /* -------------------- DISCORD SPECIFIC STUFF -------------------- */

    /**
     * Validates and attempts to fetch all users from the guild (the discord server).
     * @return A collection of guild members (server members).
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async getGuildMembers(): Promise<Collection<string, GuildMember>> {
        this.logger.debug("Attempting to fetch all guild members.");

        if (!this.interaction?.guild) {
            throw new Error("Could not get guild from interaction.");
        }

        if (!this.interaction.guild?.members) {
            throw new Error("Could not get members from guild.");
        }

        const guildMembers = await this.interaction.guild.members?.fetch();
        if (!guildMembers) {
            throw new Error("Failed to fetch members from guild.");
        }

        this.logger.debug("Successfully fetched all guild members.");
        return guildMembers
    }

    /**
     * Validates and attempts to fetch a channel from the guild using a channel id.
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

        let replyMessage = error ? cmdProperties.ErrorMessage : cmdProperties.ReplyMessage;

        const response = this.interaction.deferred ?
            await this.interaction.editReply(replyMessage) :
            await this.interaction.reply({ content: replyMessage, ephemeral: cmdProperties.Ephemeral });

        if (response && !error) this.logger.info(`Successfully replied to '${this.interaction.user.username}' who used command /${this.interaction.commandName}.`);
        if (response && error) this.logger.error(`Failed to execute command /${this.interaction.commandName} for user '${this.interaction.user.username}' with error message '${replyMessage}'.`);

        return response;
    }

    /**
     * Validates and attempts to fetch a role from the guild using a role id.
     * @param roleId Id to use to try and find corresponding guild role.
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
     * Validates and attempts to fetch a member from the guild who used the command.
     * @return Guild member who used the command.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async getCommandUserMember(): Promise<GuildMember> {

        if (!this.interaction?.guild) {
            throw new Error("Could not get guild from interaction.");
        }

        if (!this.interaction.guild?.members) {
            throw new Error("Could not get members from guild.");
        }

        const member = await this.interaction.guild.members.fetch(this.interaction.user.id) as GuildMember;
        if (!member) {
            throw new Error("Could not fetch member from guild members.")
        }

        return member;
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

    /* -------------------- GOOGLE SHEETS STUFF -------------------- */

    /**
     * Attempts to find a single row on a Google sheet using a filter made using a callback function.
     * Throws an error if one single result was not found.
     * @param filter The callback function used for the filter.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async findRow(filter: (value: GoogleSpreadsheetRow<TRowData>, index: number, array: GoogleSpreadsheetRow<TRowData>[]) => boolean): Promise<GoogleSpreadsheetRow<TRowData>> {
        const data = await getSheet();
        const rows = await data.getRows<TRowData>();

        this.googleLogger.debug("Attempting to filter rows for a single result.");
        const filteredRows = rows.filter(filter);

        if (filteredRows.length !== 1) {
          throw new Error("Filter did not find a unique row, please try again");
        }

        this.googleLogger.debug("Successfully filtered rows for a single result.");
        return filteredRows[0];
    }

    /**
     * Attempts to update the data on a found row using a callback function. Callback function sets the data of the cells and this function saves those changes.
     * @param row The found row to save the changes to.
     * @param func The callback function that is used to update the cells that is then saved.
     * @param dataInput Data input that is used to set the data to save to the cells.
     * @return True or false depending on if the data was successfully saved or not
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async updateSheet(row: GoogleSpreadsheetRow, func: (a: IUpdateDataInput<TRowData> | undefined) => void, dataInput?: IUpdateDataInput<TRowData>): Promise<boolean> {
        try {
            this.googleLogger.debug("Attempting to update data in sheet.");

            func(dataInput);
            await row.save();

            this.googleLogger.debug("Successfully updated data in sheet.");
            return true;
        } catch (error) {
            this.googleLogger.error("Failed to update data in sheet", error);
            return false;
        }
    }
}