import { ChannelType, Collection, GuildMember, InteractionResponse, TextChannel } from "discord.js";
import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../typing-helpers/enums/ELoggerCategory";
import { promises } from "fs";

const logger = getLogger(ELoggerCategory.Command);

/* -------------------- DISCORD SPECIFIC STUFF -------------------- */

/**
 * Attempts to return a collection of guildmembers (server members).
 * You still need to make sure the promise doesnt resolve to null after using this function.
 * 
 * @param commandInput the command inputs.
 */
export const validateGuildMembers = async (commandInput: ICommandInput): Promise<Collection<string, GuildMember> | null> => {
    try {
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
        if (guildMembers) return guildMembers
    } catch (error) {
        logger.error("Failed to fetch all guild members.", error);
    }
    
    return null
}

/**
 * Attempts to return the text chat that the command was used in. Will only check for normal text chats.
 * You still need to make sure the promise doesnt resolve to null after using this function.
 *
 * @param commandInput the command inputs.
 */
export const validateTextChannel = async (commandInput: ICommandInput): Promise<TextChannel | null> => {
    try {
        logger.debug("Attempting to fetch text channel.");
        
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
    } catch (error) {
        logger.error("Failed to fetch text channel.", error);
    }
    
    return null
}

/**
 * Attempts to send a reply to the user who used a command.
 *
 * @param commandInput the command inputs.
 * @param replyMessage the message to send if the reply is successful.
 */
export const sendReply = async (commandInput: ICommandInput, replyMessage: string): Promise<InteractionResponse<boolean> | null> => {
    try {
        logger.debug("Attempting to send a reply to the command.");
        
        const commandResponse = await commandInput.interaction.reply(replyMessage);
        
        logger.debug("Successfully sent a reply to the command.");
        return commandResponse;
    } catch (error) {
        logger.error("Failed to send a reply to the command.", error);
    }
    
    return null;
}

export const getStringValue = (commandInput: ICommandInput, valueName: string) => {
    // @ts-ignore
    return commandInput.interaction.options.getString(valueName);
}

/* -------------------- FILE STUFF -------------------- */

/**
 * Global var for createFile and sendFile functions.
 */
let __filePath: string | undefined;

/**
 * Const global var to store file path to generated-files.
 */
const generatedFilesFolder: string = "./src/generated-files/"

/**
 * Will throw an error if the global var filePath is invalid. Call before needing to use the filePath for any reason.
 */
const validateFilePath = (): boolean => {
    if (!__filePath) {
        throw new Error("filePath is undefined, please call 'createFile' before any other file related functions.");
    }
    
    const thirdLastLetterIndex = __filePath.length - 4;
    if (__filePath[thirdLastLetterIndex] !== '.') {
        throw new Error("fileName did not include a file extension, please give fileName a file extension.")
    }
    
    return true;
}

/**
 * Attempts to create a file in the generated-files folder.
 *
 * @param fileName what the file will be called (must include file extension).
 * @param dataToWrite what will be written to the file during creation.
 */
export const createFile = async (fileName: string, dataToWrite: string) => {
    try {
        logger.debug("Attempting to create file.");
        
        __filePath = generatedFilesFolder + fileName;
        validateFilePath();
        await promises.writeFile(__filePath, dataToWrite);
        
        logger.debug("Successfully created file.");
    } catch (error) {
        logger.error("Failed to create file.", error);
    }
}

/**
 * Attempt to send a file to the specified channel.
 *
 * @param channel channel to send the file to.
 * @param fileName name of file you want to send, leave empty to send last created file.
 */
export const sendFile = async (channel: TextChannel, fileName?: string) => {
    try {
        logger.debug("Attempting to send file to channel.");
        
        validateFilePath()
        
        if (__filePath) {
            const filePath = !fileName ? __filePath : generatedFilesFolder + fileName;
            await channel.send({files: [filePath]})
        }
        
        logger.debug("Successfully sent file to channel.");
    } catch (error) {
        logger.error("Failed to send file to channel.", error);
    }
}

