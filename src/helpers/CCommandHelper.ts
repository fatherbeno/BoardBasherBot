import { ChannelType, Client, Collection, CommandInteraction, GuildMember, Role, TextChannel } from "discord.js";
import { ICommandInput } from "../types/interfaces/ICommandInput";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";
import { promises, existsSync, readFileSync, writeFileSync } from "fs";
import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { IUpdateDataInput } from "../types/interfaces/IUpdateDataInput";
import { TRowData } from "../types/types/TRowData";
import { getSheet } from "../google-sheet";
import { IFilePayload } from "../types/interfaces/IFilePayload";
import { CCommandProperties } from "../types/classes/CCommandProperties";
import { GlobalProperties } from "./CGlobalPropertiesHelper";

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
     * Reference to the client. (aka the bot)
     * @private
     */
    private readonly _client: Client;

    /**
     * Received command when class was created.
     */
    public get interaction(): CommandInteraction { return this._interaction; }

    /**
     * Reference to the client. (aka the bot)
     */
    public get client(): Client { return this._client; }

    /**
     * To be used when you want to execute a command. All cross command functionality is handled while unique command functionality is created within the callback.
     * @param func Callback function that is executed within this function.
     */
    public executeCommand = async (func?: () => Promise<void>) => {
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
    private readonly fileLogger = getLogger(ELoggerCategory.GeneratedFiles);
    private readonly googleLogger = getLogger(ELoggerCategory.GoogleSheets);

    /**
     * Logs a command error and then sends an error message to the user.
     * @param error Error message to be displayed in the logs.
     */
    public logCommandError = async (error: any) => {
        this.logger.error(`Command ${this.interaction.commandName} has failed to execute.`, error);

        if (!this.interaction.replied) {
            await this.sendReply(true);
        }
    }

    /* -------------------- INTEGRATION STUFF -------------------- */

    /**
     * File location of the command properties file.
     */
    private readonly _commandPropertiesJson = "./src/commands/properties/command-properties.json";

    /**
     * Reads command properties file and transforms it to a usable map format.
     * @return A command name, command properties map for every command.
     */
    private readCommandProperties = (): Map<string, CCommandProperties> => {
        const commandPropertiesJson = readFileSync(this._commandPropertiesJson, "utf-8");
        return new Map<string, CCommandProperties>(Object.entries(JSON.parse(commandPropertiesJson)));
    }

    /**
     * Loads command properties from json file in runtime, file can be changed and changes will be reflected without rebuilding.
     * @param inCommandName Name of command to get the properties for.
     */
    public getCommandProperties = (inCommandName?: string): CCommandProperties => {
        const commandName = inCommandName ? inCommandName : this.interaction.commandName;
        const properties = this.readCommandProperties().get(commandName);

        return properties ? properties : new CCommandProperties("", GlobalProperties.getProperties().CommandErrorMessage);
    }

    /**
     * Sets a property on a specific command in runtime and saves it to a json file.
     * @param commandName Name of command to set the property for.
     * @param property Name of property being set.
     * @param value Value of the changed property.
     */
    public setCommandProperties = (commandName: string, property: string, value: string) => {
        this.logger.debug(`Attempting to change property: ${property} on command: /${commandName} with value: ${value}.`);

        const allCommandProperties = this.readCommandProperties();
        const commandProperty = this.getCommandProperties(commandName);

        const propertyKey = property as keyof typeof commandProperty;

        if (property !== "Ephemeral") {
            (commandProperty[propertyKey] as string) = value;
        } else {
            (commandProperty[propertyKey] as boolean) = JSON.parse(value);
        }

        allCommandProperties.set(commandName, commandProperty);

        const data = JSON.stringify(Object.fromEntries(allCommandProperties), null, 2);
        writeFileSync(this._commandPropertiesJson, data);

        this.logger.debug(`Property: ${property} on command: /${commandName} was successfully change to value: ${value}.`);
    }

    /**
     * File location of the verify roles file.
     */
    private _verifyRolesJson = "./src/commands/properties/verify-roles.json";

    /**
     * Reads verify roles file and transforms it to a usable json format.
     */
    private readVerifyRoles = () => {
        const verifyRolesJson = readFileSync(this._verifyRolesJson, "utf-8");
        return JSON.parse(verifyRolesJson);
    }

    /**
     * Loads verify roles from json file in runtime, file can be changed and changes will be reflected without rebuilding.
     */
    public getVerifyRoles = async (): Promise<Role[]> => {
        const verifyRolesJson = this.readVerifyRoles()
        const verifyRoles = verifyRolesJson as string[]

        let roles: Role[] = []

        for (let roleId of verifyRoles) {
            roles.push(await this.getRole(roleId))
        }

        return roles;
    }

    public setVerifyRoles = (roles: Role[]) => {
        let roleIds: string[] = [];

        roles.forEach((role) => {
            roleIds.push(role.id);
        })

        const fileData = JSON.stringify(roleIds, null, 2);
        writeFileSync(this._verifyRolesJson, fileData);
    }

    /* -------------------- DISCORD SPECIFIC STUFF -------------------- */

    /**
     * Validates and attempts to fetch all users from the guild. (the discord server)
     * @return A collection of guild members (server members).
     */
    public getGuildMembers = async (): Promise<Collection<string, GuildMember>> => {
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
     */
    public getTextChannel = async (inChannelId: string = ""): Promise<TextChannel> => {
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
     */
    public sendReply = async (error: boolean = false) => {
        if (this.interaction.replied) { return }

        const cmdProperties = this.getCommandProperties();

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
     */
    public getRole = async (roleId: string): Promise<Role> => {
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
     */
    public getCommandUserMember = async (): Promise<GuildMember> => {

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
     */
    public getStringValue = (valueName: string): string => {
        // @ts-ignore
        return this.interaction.options.getString(valueName);
    }

    /**
     * Returns value of addRoleOption on command depending on value name.
     * @param valueName Name used to find data of a value.
     */
    public getRoleValue = (valueName: string): Role => {
        // @ts-ignore
        return this.interaction.options.getRole(valueName);
    }

    /**
     * If a command takes more then 3 seconds to execute, the reply needs to be deferred so it doesn't time out.
     */
    public deferReply = async () => {
        await this.interaction.deferReply({ ephemeral: this.getCommandProperties().Ephemeral });
    }

    /* -------------------- FILE STUFF -------------------- */

    /**
     * Global var for createFile and sendFile functions.
     */
    private _filePath: string | undefined;

    /**
     * Const global var to store file path to generated-files.
     */
    private generatedFilesFolder: string = "./src/generated-files"

    /**
     * Will throw an error if the global var filePath is invalid. Call before needing to use the filePath for any reason.
     */
    private validateFilePath = (): string => {
        if (!this._filePath) {
            throw new Error("filePath is undefined, please call 'createFile' before any other file related functions.");
        }

        const thirdLastLetterIndex = this._filePath.length - 4;
        if (this._filePath[thirdLastLetterIndex] !== '.') {
            throw new Error("fileName did not include a valid file extension, please give fileName a valid file extension.");
        }

        return this._filePath;
    }

    /**
     * Updates filePath global var and returns a validated filePath string.
     *
     * @param fileName name of file.
     */
    private setFilePath = (fileName: string): string => {
        this._filePath = this.generatedFilesFolder + "/" + fileName;
        return this.validateFilePath();
    }

    /**
     * Checks if the folder exists to create the new file; if it doesn't, it creates the folder.
     */
    private validateFileFolder = async () => {
        if (!existsSync(this.generatedFilesFolder)) {
            await promises.mkdir(this.generatedFilesFolder);
        }
    }

    /**
     * Attempts to create a file in the generated-files folder.
     *
     * @param fileName what the file will be called (must include file extension).
     * @param dataToWrite what will be written to the file during creation.
     */
    public createFile = async (fileName: string, dataToWrite: string) => {
        try {
            this.fileLogger.debug("Attempting to create file.");

            await this.validateFileFolder();
            const filePath = this.setFilePath(fileName);
            await promises.writeFile(filePath, dataToWrite);

            this.fileLogger.debug("Successfully created file.");
        } catch (error) {
            this.fileLogger.error("Failed to create file.", error);
        }
    }

    /**
     * Attempt to send a file to the specified channel.
     *
     * @param payload IFilePayload to use to send file.
     */
    public sendFile = async (payload: IFilePayload) => {
        try {
            this.fileLogger.debug("Attempting to send file to recipient.");

            const filePath = !payload.fileName ? this.validateFilePath() : this.setFilePath(payload.fileName);
            await payload.recipient.send({content: payload.message, files: [filePath]});
            await promises.rm(filePath);

            this.fileLogger.debug("Successfully sent file to channel.");
        } catch (error) {
            this.fileLogger.error("Failed to send file to channel.", error);
        }
    }

    /* -------------------- GOOGLE SHEETS STUFF -------------------- */

    /**
     * Attempts to find a single row on a Google sheet using a filter made using a callback function.
     * Throws an error if one single result was not found.
     * @param filter The callback function used for the filter.
     */
    public findRow = async (filter: (value: GoogleSpreadsheetRow<TRowData>, index: number, array: GoogleSpreadsheetRow<TRowData>[]) => boolean): Promise<GoogleSpreadsheetRow<TRowData>> => {
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
     */
    public updateSheet = async (row: GoogleSpreadsheetRow, func: (a: IUpdateDataInput<TRowData> | undefined) => void, dataInput?: IUpdateDataInput<TRowData>): Promise<boolean> => {
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