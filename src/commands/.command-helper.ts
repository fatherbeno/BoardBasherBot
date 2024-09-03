import { ChannelType, Collection, GuildMember, TextChannel } from "discord.js";
import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../typing-helpers/enums/ELoggerCategory";
import { promises, existsSync, readFileSync, writeFileSync } from "fs";
import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { IUpdateDataInput } from "../typing-helpers/interfaces/IUpdateDataInput";
import { TRowData } from "../typing-helpers/types/TRowData";
import { getSheet } from "../google-sheet";
import { IFilePayload } from "../typing-helpers/interfaces/IFilePayload";
import { CCommandProperties } from "../typing-helpers/classes/CCommandProperties";

/* -------------------- LOGGING STUFF -------------------- */

const logger = getLogger(ELoggerCategory.Command);
const fileLogger = getLogger(ELoggerCategory.GeneratedFiles);
const googleLogger = getLogger(ELoggerCategory.GoogleSheets);

export const logCommandError = async (commandInput: ICommandInput, error: any) => {
    logger.error(`Command ${commandInput.interaction.commandName} has failed to execute.`, error);
    
    if (!commandInput.interaction.replied) {
        await sendReply(commandInput, true);
    }
}

/* -------------------- DISCORD SPECIFIC STUFF -------------------- */

/**
 * File location of the command properties file.
 */
const __commandPropertiesJson = "./src/commands/properties/command-properties.json";

const readCommandProperties = () => {
    const commandPropertiesJson = readFileSync(__commandPropertiesJson, "utf-8");
    return JSON.parse(commandPropertiesJson);
}

/**
 * Loads command properties from JSON file in runtime, file can be changed and changes will be reflected without rebuilding.
 *
 * @param commandInput the command inputs.
 */
export const getCommandProperties = (commandInput: ICommandInput) => {
    const commandProperties = readCommandProperties()
    
    return commandProperties[commandInput.interaction.commandName as keyof typeof commandProperties] as CCommandProperties;
}

export const setCommandProperties = (commandName: string, property: string, value: string) => {
    logger.debug(`Attempting to change property: ${property} on command: /${commandName} with value: ${value}.`)
    
    const allCommandProperties = readCommandProperties();
    const commandProperties = allCommandProperties[commandName as keyof typeof allCommandProperties];
    
    if (property !== "ephemeral") {
        (commandProperties[property as keyof typeof commandProperties] as string) = value;
    } else {
        (commandProperties[property as keyof typeof commandProperties] as boolean) = JSON.parse(value);
    }
    
    allCommandProperties[commandName as keyof typeof allCommandProperties] = commandProperties;
    
    const data = JSON.stringify(allCommandProperties, null, 2);
    writeFileSync(__commandPropertiesJson, data);
    
    logger.debug(`Property: ${property} on command: /${commandName} was successfully change to value: ${value}.`)
}

/**
 * Attempts to return a collection of guildmembers (server members).
 * 
 * @param commandInput the command inputs.
 */
export const getGuildMembers = async (commandInput: ICommandInput): Promise<Collection<string, GuildMember>> => {
    logger.debug("Attempting to fetch all guild members.");
    
    if (!commandInput.interaction?.guild) {
        throw new Error("Could not get guild from interaction.");
    }
    
    if (!commandInput.interaction.guild?.members) {
        throw new Error("Could not get members from guild.");
    }
    
    const guildMembers = await commandInput.interaction.guild.members?.fetch();
    if (!guildMembers) {
        throw new Error("Failed to fetch members from guild.");
    }
    
    logger.debug("Successfully fetched all guild members.");
    return guildMembers
}

/**
 * Attempts to return the text chat that the command was used in. Will only check for normal text chats.
 *
 * @param commandInput the command inputs.
 */
export const getTextChannel = async (commandInput: ICommandInput): Promise<TextChannel> => {
    const channelId = commandInput.interaction?.channelId;
    if (!channelId) {
        throw new Error("Could not get channelId from interaction.");
    }
    
    const channel = await commandInput.client?.channels.fetch(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
        throw new Error("Could not fetch channel from client, or fetched channel was not a text channel.");
    }
    
    logger.debug("Successfully fetched text channel.");
    return channel
}

/**
 * Attempts to send a reply to the user who used a command.
 *
 * @param commandInput the command inputs.
 * @param error optional param to log an error if true.
 */
export const sendReply = async (commandInput: ICommandInput, error: boolean = false) => {
    if (commandInput.interaction.replied) { return }
    
    const cmdProperties = getCommandProperties(commandInput);
    
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
    
    const response = commandInput.interaction.deferred ?
        await commandInput.interaction.editReply(replyMessage) :
        await commandInput.interaction.reply({ content: replyMessage, ephemeral: cmdProperties?.ephemeral });

    if (response && !error) logger.info(`Successfully replied to '${commandInput.interaction.user.username}' who used command /${commandInput.interaction.commandName}.`);
    if (response && error) logger.error(`Failed to execute command /${commandInput.interaction.commandName} for user '${commandInput.interaction.user.username}' with error message '${replyMessage}'.`);

    return response;
}

export const getStringValue = (commandInput: ICommandInput, valueName: string) => {
    // @ts-ignore
    return commandInput.interaction.options.getString(valueName);
}

export const deferReply = async (commandInput: ICommandInput) => {
    await commandInput.interaction.deferReply({ ephemeral: true });
}

/* -------------------- FILE STUFF -------------------- */

/**
 * Global var for createFile and sendFile functions.
 */
let __filePath: string | undefined;

/**
 * Const global var to store file path to generated-files.
 */
const generatedFilesFolder: string = "./src/generated-files"

/**
 * Will throw an error if the global var filePath is invalid. Call before needing to use the filePath for any reason.
 */
const validateFilePath = (): string => {
    if (!__filePath) {
        throw new Error("filePath is undefined, please call 'createFile' before any other file related functions.");
    }
    
    const thirdLastLetterIndex = __filePath.length - 4;
    if (__filePath[thirdLastLetterIndex] !== '.') {
        throw new Error("fileName did not include a valid file extension, please give fileName a valid file extension.");
    }
    
    return __filePath;
}

/**
 * Updates filePath global var and returns a validated filePath string.
 *
 * @param fileName name of file.
 */
const setFilePath = (fileName: string): string => {
    __filePath = generatedFilesFolder + "/" + fileName;
    return validateFilePath();
}

/**
 * Checks if the a folder exists to create the new file; if it doesn't, it creates the folder.
 */
const validateFileFolder = async () => {
    if (!existsSync(generatedFilesFolder)) {
        await promises.mkdir(generatedFilesFolder);
    }
}

/**
 * Attempts to create a file in the generated-files folder.
 *
 * @param fileName what the file will be called (must include file extension).
 * @param dataToWrite what will be written to the file during creation.
 */
export const createFile = async (fileName: string, dataToWrite: string) => {
    try {
        fileLogger.debug("Attempting to create file.");
        
        await validateFileFolder();
        const filePath = setFilePath(fileName);
        await promises.writeFile(filePath, dataToWrite);
        
        fileLogger.debug("Successfully created file.");
    } catch (error) {
        fileLogger.error("Failed to create file.", error);
    }
}

/**
 * Attempt to send a file to the specified channel.
 *
 * @param payload IFilePayload to use to send file.
 */
export const sendFile = async (payload: IFilePayload) => {
    try {
        fileLogger.debug("Attempting to send file to channel.");
        
        const filePath = !payload.fileName ? validateFilePath() : setFilePath(payload.fileName);
        await payload.recipient.send({content: payload.message, files: [filePath]});
        await promises.rm(filePath);
        
        fileLogger.debug("Successfully sent file to channel.");
    } catch (error) {
        fileLogger.error("Failed to send file to channel.", error);
    }
}

/* -------------------- GOOGLE SHEETS STUFF -------------------- */

/**
 * Attempts to find a single row on a google sheet using a filter made using a callback function.
 *
 * @param filter the callback function used for the filter.
 */
export const findRow = async (filter: (value: GoogleSpreadsheetRow<TRowData>, index: number, array: GoogleSpreadsheetRow<TRowData>[]) => boolean): Promise<GoogleSpreadsheetRow<TRowData>> => {
    const data = await getSheet();
    const rows = await data.getRows<TRowData>();
    
    googleLogger.debug("Attempting to filter rows for a single result.");
    const filteredRows = rows.filter(filter);
    
    if (filteredRows.length !== 1) {
      throw new Error("Filter did not find a unique row, please try again");
    }
    
    googleLogger.debug("Successfully filtered rows for a single result.");
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
export const updateSheet = async (row: GoogleSpreadsheetRow, func: (a: IUpdateDataInput<TRowData> | undefined) => void, dataInput?: IUpdateDataInput<TRowData>): Promise<boolean> => {
    try {
        googleLogger.debug("Attempting to update data in sheet.");
        
        func(dataInput);
        await row.save();
        
        googleLogger.debug("Successfully updated data in sheet.");
        return true;
    } catch (error) {
        googleLogger.error("Failed to update data in sheet", error);
        return false;
    }
}