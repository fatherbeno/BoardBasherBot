import { ChannelType, Client, Collection, CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { ICommandInput } from "../interfaces/ICommandInput";
import { getLogger } from "../../logging-config";
import { ELoggerCategory } from "../enums/ELoggerCategory";
import { promises, existsSync, readFileSync, writeFileSync } from "fs";
import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { IUpdateDataInput } from "../interfaces/IUpdateDataInput";
import { TRowData } from "../types/TRowData";
import { getSheet } from "../../google-sheet";
import { IFilePayload } from "../interfaces/IFilePayload";
import { CCommandProperties } from "./CCommandProperties";

export class CCommandHelper {
    /* -------------------- CLASS STUFF -------------------- */
    
    constructor(commandInput: ICommandInput) {
        this.__interaction = commandInput.interaction;
        this.__client = commandInput.client;
    }
    
    private readonly __interaction: CommandInteraction
    private readonly __client: Client
    
    public get interaction(): CommandInteraction { return this.__interaction }
    public get client(): Client { return this.__client }
    
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
    
    public logCommandError = async (error: any) => {
        this.logger.error(`Command ${this.__interaction.commandName} has failed to execute.`, error);
        
        if (!this.__interaction.replied) {
            await this.sendReply(true);
        }
    }
    /* -------------------- DISCORD SPECIFIC STUFF -------------------- */

    /**
     * File location of the command properties file.
     */
    private readonly  __commandPropertiesJson = "./src/commands/properties/command-properties.json";
    
    private readCommandProperties = () => {
        const commandPropertiesJson = readFileSync(this.__commandPropertiesJson, "utf-8");
        return JSON.parse(commandPropertiesJson);
    }
    
    /**
     * Loads command properties from JSON file in runtime, file can be changed and changes will be reflected without rebuilding.
     */
    public getCommandProperties = () => {
        const commandProperties = this.readCommandProperties()
        
        return commandProperties[this.__interaction.commandName as keyof typeof commandProperties] as CCommandProperties;
    }
    
    public setCommandProperties = (commandName: string, property: string, value: string) => {
        this.logger.debug(`Attempting to change property: ${property} on command: /${commandName} with value: ${value}.`)
        
        const allCommandProperties = this.readCommandProperties();
        const commandProperties = allCommandProperties[commandName as keyof typeof allCommandProperties];
        
        if (property !== "ephemeral") {
            (commandProperties[property as keyof typeof commandProperties] as string) = value;
        } else {
            (commandProperties[property as keyof typeof commandProperties] as boolean) = JSON.parse(value);
        }
        
        allCommandProperties[commandName as keyof typeof allCommandProperties] = commandProperties;
        
        const data = JSON.stringify(allCommandProperties, null, 2);
        writeFileSync(this.__commandPropertiesJson, data);
        
        this.logger.debug(`Property: ${property} on command: /${commandName} was successfully change to value: ${value}.`)
    }
    
    /**
     * Attempts to return a collection of guildmembers (server members).
     */
    public getGuildMembers = async (): Promise<Collection<string, GuildMember>> => {
        this.logger.debug("Attempting to fetch all guild members.");
        
        if (!this.__interaction?.guild) {
            throw new Error("Could not get guild from interaction.");
        }
        
        if (!this.__interaction.guild?.members) {
            throw new Error("Could not get members from guild.");
        }
        
        const guildMembers = await this.__interaction.guild.members?.fetch();
        if (!guildMembers) {
            throw new Error("Failed to fetch members from guild.");
        }
        
        this.logger.debug("Successfully fetched all guild members.");
        return guildMembers
    }
    
    /**
     * Attempts to return the text chat that the command was used in. Will only check for normal text chats.
     */
    public getTextChannel = async (): Promise<TextChannel> => {
        const channelId = this.__interaction?.channelId;
        if (!channelId) {
            throw new Error("Could not get channelId from interaction.");
        }
        
        const channel = await this.__client?.channels.fetch(channelId);
        if (!channel || channel.type !== ChannelType.GuildText) {
            throw new Error("Could not fetch channel from client, or fetched channel was not a text channel.");
        }
        
        this.logger.debug("Successfully fetched text channel.");
        return channel
    }
    
    /**
     * Attempts to send a reply to the user who used a command.
     *
     * @param error optional param to log an error if true.
     */
    public sendReply = async (error: boolean = false) => {
        if (this.__interaction.replied) { return }
        
        const cmdProperties = this.getCommandProperties();
        
        // throw error if command properties were not found and reply was not intended to be an error.
        if (!cmdProperties && !error) {
            throw new Error("Unable to get command properties, please make sure there is an entry in the properties file for this command.");
        }
        
        let replyMessage: string;
        
        if (!cmdProperties) {
            replyMessage = "An issue has occured, please try again later."; // needs to be set to global var
        } else {
            replyMessage = error ? cmdProperties.errorMessage : cmdProperties.replyMessage;
        }
        
        const response = this.__interaction.deferred ?
            await this.__interaction.editReply(replyMessage) :
            await this.__interaction.reply({ content: replyMessage, ephemeral: cmdProperties?.ephemeral });
    
        if (response && !error) this.logger.info(`Successfully replied to '${this.__interaction.user.username}' who used command /${this.__interaction.commandName}.`);
        if (response && error) this.logger.error(`Failed to execute command /${this.__interaction.commandName} for user '${this.__interaction.user.username}' with error message '${replyMessage}'.`);
    
        return response;
    }
    
    public getStringValue = (valueName: string) => {
        // @ts-ignore
        return this.__interaction.options.getString(valueName);
    }
    
    public deferReply = async () => {
        await this.__interaction.deferReply({ ephemeral: true });
    }

    /* -------------------- FILE STUFF -------------------- */
    
    /**
     * Global var for createFile and sendFile functions.
     */
    private __filePath: string | undefined;
    
    /**
     * Const global var to store file path to generated-files.
     */
    private generatedFilesFolder: string = "./src/generated-files"
    
    /**
     * Will throw an error if the global var filePath is invalid. Call before needing to use the filePath for any reason.
     */
    private validateFilePath = (): string => {
        if (!this.__filePath) {
            throw new Error("filePath is undefined, please call 'createFile' before any other file related functions.");
        }
        
        const thirdLastLetterIndex = this.__filePath.length - 4;
        if (this.__filePath[thirdLastLetterIndex] !== '.') {
            throw new Error("fileName did not include a valid file extension, please give fileName a valid file extension.");
        }
        
        return this.__filePath;
    }
    
    /**
     * Updates filePath global var and returns a validated filePath string.
     *
     * @param fileName name of file.
     */
    private setFilePath = (fileName: string): string => {
        this.__filePath = this.generatedFilesFolder + "/" + fileName;
        return this.validateFilePath();
    }
    
    /**
     * Checks if the a folder exists to create the new file; if it doesn't, it creates the folder.
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
     * Attempts to find a single row on a google sheet using a filter made using a callback function.
     *
     * @param filter the callback function used for the filter.
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
     *
     * @param row the found row to save the changes to.
     * @param func the callback function that is used to update the cells that is then saved.
     * @param dataInput data input that is used to set the data to save to the cells.
     *
     * @return true or false depending if the data was successfully saved or not
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